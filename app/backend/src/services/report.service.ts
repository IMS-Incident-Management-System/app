import { Op } from 'sequelize';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { Incident, Event, OperationalActivity, Department } from '../models';
import { REPORT_FIELDS } from '../constants/reportFields';
import { computeFieldValueByRule } from './reportCalculator';

const QUICKCHART_URL = 'https://quickchart.io/chart';
const QUICKCHART_MAX_WIDTH = 4000;
const QUICKCHART_MAX_HEIGHT = 2400;
/** Макс. число серий в столбчатом графике — при большем QuickChart возвращает 400 (лимит размера запроса). */
const COLUMN_CHART_MAX_DATASETS = 80;

/** Получить PNG графика через QuickChart API (Chart.js config; при formatter — config как строка). */
async function getChartPng(
  config: { type: string; data: unknown; options?: unknown } | string,
  width = 520,
  height = 320
): Promise<Buffer> {
  const w = Math.min(width, QUICKCHART_MAX_WIDTH);
  const h = Math.min(height, QUICKCHART_MAX_HEIGHT);
  try {
    const res = await axios.post(
      QUICKCHART_URL,
      { chart: config, width: w, height: h, format: 'png', backgroundColor: 'white' },
      { responseType: 'arraybuffer', timeout: 60000 }
    );
    return Buffer.from(res.data);
  } catch (err: unknown) {
    const axiosError = err as { response?: { status: number; data?: unknown }; message?: string };
    const body = axiosError.response?.data;
    let msg = '';
    if (body != null) {
      if (typeof body === 'string') msg = body;
      else {
        const buf = Buffer.isBuffer(body) ? body : Buffer.from(body as ArrayBuffer);
        const s = buf.toString('utf8');
        if (/^[\x20-\x7e\u0400-\u04ff\s]+$/.test(s) && s.length < 500) msg = s;
      }
    }
    if (!msg) msg = axiosError.message ?? '';
    console.error('[getChartPng] QuickChart error:', axiosError.response?.status, msg.slice(0, 300));
    throw new Error(`Ошибка построения графика: ${axiosError.response?.status === 400 ? 'некорректные данные или превышен лимит размера' : axiosError.response?.status ?? 'сеть'}. ${msg.slice(0, 150)}`);
  }
}

/** Стили для Excel-отчёта: строго и читаемо */
const EXCEL_STYLE = {
  borderThin: { style: 'thin' as const, color: { argb: 'FFB0B0B0' } },
  borderMedium: { style: 'medium' as const, color: { argb: 'FF606060' } },
  fillTitle: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF2E5090' } },
  fillHeader: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD6DCE4' } },
  fillHeaderIndicator: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE2E6EB' } },
  fillTotal: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF0F0F0' } },
  fontTitle: { size: 16, bold: true, color: { argb: 'FFFFFFFF' } },
  fontHeader: { size: 10, bold: true, color: { argb: 'FF1A1A1A' } },
  fontData: { size: 10, color: { argb: 'FF000000' } },
};
function excelBorder(style: typeof EXCEL_STYLE.borderThin) {
  return { top: style, left: style, bottom: style, right: style };
}

interface ReportField {
  entity: 'incident' | 'event' | 'operationalActivity';
  field: string;
  label: string;
}

interface ReportRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  fields?: ReportField[];
  /** Ключи полей из REPORT_FIELDS (r1..r160) — при наличии используются правила расчёта */
  fieldKeys?: string[];
}

interface TableRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  page: number;
  limit: number;
  abortSignal?: AbortSignal;
}

interface ExportRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  fieldKeys: string[];
}

/** Ячейка иерархической шапки: подпись и число объединяемых столбцов */
export interface ReportHeaderCell {
  label: string;
  span: number;
}

/** Узел дерева департаментов для построения шапки */
interface DeptTreeNode {
  departmentId: number;
  title: string;
  children: DeptTreeNode[];
}

/**
 * Строит дерево департаментов от заданных корней (дети из allDepartments, порядок по сортировке).
 */
function buildDepartmentForest(
  rootDepts: Array<{ department_id: number; title: string }>,
  allDepartments: Array<{ department_id: number; title: string; parent_id: number | null }>,
  childOrder: (a: { department_id: number; title: string }, b: { department_id: number; title: string }) => number
): DeptTreeNode[] {
  const byId = new Map(allDepartments.map((d) => [d.department_id, d]));

  function buildNode(departmentId: number): DeptTreeNode {
    const d = byId.get(departmentId);
    const title = d?.title ?? `Департамент ${departmentId}`;
    const children = allDepartments
      .filter((x) => x.parent_id === departmentId)
      .sort(childOrder)
      .map((c) => buildNode(c.department_id));
    return { departmentId, title, children };
  }

  return rootDepts.map((r) => buildNode(r.department_id));
}

/**
 * Число листьев в поддереве (для span в шапке).
 */
function countLeaves(node: DeptTreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

/**
 * Строит иерархическую шапку и упорядоченный список id листьев по обходу дерева (DFS).
 * Строки шапки: по одной на каждый уровень от корня до родителя листа, плюс строка листьев.
 * Каждая строка выравнивается по столбцам (листьям): объединяются подряд идущие одинаковые подписи.
 * Если передан selectedLeafIds — в отчёт попадают только эти листья (иерархия от корня до листа сохраняется).
 */
export function buildReportHeaderStructure(
  forest: DeptTreeNode[],
  selectedLeafIds?: Set<number>
): { headerRows: ReportHeaderCell[][]; leafDepartmentIds: number[] } {
  /** Для каждого листа в порядке обхода: путь от корня до родителя (включительно). path[0]=root, path[path.length-1]=parent. */
  const leafPaths: Array<{ leafId: number; leafTitle: string; path: string[] }> = [];

  function traverse(node: DeptTreeNode, pathFromRoot: string[]): void {
    if (node.children.length === 0) {
      if (selectedLeafIds != null && !selectedLeafIds.has(node.departmentId)) return;
      // path = root .. parent; for a leaf root, path is empty — use node title as single level
      const path = pathFromRoot.length > 0 ? pathFromRoot : [node.title];
      leafPaths.push({
        leafId: node.departmentId,
        leafTitle: node.title,
        path,
      });
    } else {
      const childPath = pathFromRoot.concat(node.title);
      for (const child of node.children) {
        traverse(child, childPath);
      }
    }
  }

  for (const root of forest) {
    traverse(root, []);
  }

  const leafIds = leafPaths.map((p) => p.leafId);
  if (leafPaths.length === 0) {
    return { headerRows: [], leafDepartmentIds: leafIds };
  }

  const numColumns = leafPaths.length;
  const maxDepth = Math.max(0, ...leafPaths.map((p) => p.path.length));
  const headerRows: ReportHeaderCell[][] = [];

  // Строки по уровням: для каждого глубины d — подпись узла на пути к листу; объединяем подряд идущие одинаковые.
  // Для строки перед листьями (d === maxDepth - 1): если лист — прямой ребёнок корня (path.length === 1), подставляем подпись листа, чтобы она объединилась по вертикали с последней строкой (ФО в 1 строке, Москва на 2 ячейки по вертикали).
  for (let d = 0; d < maxDepth; d++) {
    const labels = leafPaths.map((p) => {
      if (d < p.path.length) return p.path[d];
      if (d === maxDepth - 1 && p.path.length === 1) return p.leafTitle;
      return p.path[p.path.length - 1];
    });
    const row: ReportHeaderCell[] = [];
    let i = 0;
    while (i < numColumns) {
      const label = labels[i];
      let span = 1;
      while (i + span < numColumns && labels[i + span] === label) span++;
      row.push({ label, span });
      i += span;
    }
    headerRows.push(row);
  }

  // Последняя строка — подписи листьев (по одному столбцу на лист).
  headerRows.push(leafPaths.map((p) => ({ label: p.leafTitle, span: 1 })));

  return { headerRows, leafDepartmentIds: leafIds };
}

/**
 * Собирает для каждого выбранного листа путь от корня до родителя (path[0]=root).
 * Для группировки круговых: уровень 2 везде, где есть; где всего 2 уровня — уровень 1.
 */
function getLeafPaths(
  forest: DeptTreeNode[],
  selectedLeafIds: Set<number>
): Array<{ leafId: number; path: string[] }> {
  const result: Array<{ leafId: number; path: string[] }> = [];
  function traverse(node: DeptTreeNode, pathFromRoot: string[]): void {
    if (node.children.length === 0) {
      if (!selectedLeafIds.has(node.departmentId)) return;
      const path = pathFromRoot.length > 0 ? pathFromRoot : [node.title];
      result.push({ leafId: node.departmentId, path });
    } else {
      const childPath = pathFromRoot.concat(node.title);
      for (const child of node.children) {
        traverse(child, childPath);
      }
    }
  }
  for (const root of forest) {
    traverse(root, []);
  }
  return result;
}

/** Верхний уровень дерева отчёта: только эти корни; всё под ФО (Москва, Центр, СЗ, …) — внутри ФО, не отдельно. */
const STANDARD_ROOT_NAMES = ['КЦ', 'ЕЦКБ', 'ДЗК', 'ФО'];

/** Полный список групп ПАО МТС: для галки «ПАО МТС», сортировки и подсчёта итогов (филиалы под этими группами). */
const PAO_MTS_DEPARTMENT_NAMES = [
  'КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'
];

const BOOLEAN_FIELDS = new Set([
  'is_service_investigation', 'is_service_investigation_ib', 'is_service_investigation_bpio',
  'is_service_investigation_bpio_hotline', 'is_service_check', 'is_service_check_ib',
  'is_service_check_bpio', 'is_service_check_bpio_hotline', 'is_verification_activity', 'is_db'
]);

async function computeFieldValueLegacy(
  field: ReportField,
  departmentId: number,
  dateFrom: Date,
  dateTo: Date
): Promise<number> {
  const dateToEnd = new Date(dateTo);
  dateToEnd.setHours(23, 59, 59, 999);
  const isBoolean = BOOLEAN_FIELDS.has(field.field);
  const whereBase = {
    department_id: departmentId,
    createdAt: { [Op.between]: [dateFrom, dateToEnd] } as any,
  };

  if (field.entity === 'incident') {
    if (isBoolean) {
      const count = await Incident.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await Incident.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  if (field.entity === 'event') {
    if (isBoolean) {
      const count = await Event.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await Event.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  if (field.entity === 'operationalActivity') {
    if (isBoolean) {
      const count = await OperationalActivity.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await OperationalActivity.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  return 0;
}

export const reportService = {
  /**
   * Генерация Excel отчета
   */
  async generateReport(request: ReportRequest): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчет');

    const departments = await Department.findAll({
      where: { department_id: { [Op.in]: request.departmentIds } },
    });
    
    // Функция для получения всех потомков департамента
    const allDepartmentsForCalc = await Department.findAll();
    const getAllDescendants = (parentId: number): number[] => {
      const result = [parentId];
      const children = allDepartmentsForCalc.filter((d) => d.parent_id === parentId);
      for (const child of children) {
        result.push(...getAllDescendants(child.department_id));
      }
      return result;
    };

    /** Листья поддерева: только самые нижние подразделения. Отчётность по фактическим данным филиалов. */
    const getLeafDescendants = (parentId: number): number[] => {
      const children = allDepartmentsForCalc.filter((d) => d.parent_id === parentId);
      if (children.length === 0) {
        return [parentId];
      }
      const result: number[] = [];
      for (const child of children) {
        result.push(...getLeafDescendants(child.department_id));
      }
      return result;
    };
    
    // Департаменты ПАО МТС (белый список) — для сортировки и итогов
    const paoMtsIdsForExcel = new Set<number>();
    const paoMtsNameToId = new Map<string, number>();
    
    for (const name of PAO_MTS_DEPARTMENT_NAMES) {
      const dept = allDepartmentsForCalc.find((d) => d.title === name);
      if (dept) {
        paoMtsNameToId.set(name, dept.department_id);
        getAllDescendants(dept.department_id).forEach(id => paoMtsIdsForExcel.add(id));
      }
    }
    
    // Сортируем департаменты по заданному порядку ПАО МТС
    const sortedDepartments = [...departments].sort((a, b) => {
      const aIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === a.department_id || getAllDescendants(id || 0).includes(a.department_id);
      });
      const bIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === b.department_id || getAllDescendants(id || 0).includes(b.department_id);
      });
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
    
    // Проверяем, все ли выбранные департаменты входят в ПАО МТС
    const allSelectedArePaoMts = sortedDepartments.every(dept => paoMtsIdsForExcel.has(dept.department_id));

    // Дерево от стандартных корней (КЦ, ЕЦКБ, ДЗК, ФО); в отчёт — только листья под выбранными группами (при галке ПАО МТС — все филиалы под КЦ, Москва, Центр и т.д.)
    const allDeptsForTree = allDepartmentsForCalc.map((d) => ({
      department_id: d.department_id,
      title: d.title,
      parent_id: d.parent_id,
    }));
    const selectedLeafIds = new Set(
      sortedDepartments.flatMap((d) => getLeafDescendants(d.department_id))
    );
    const rootDepts = STANDARD_ROOT_NAMES.map((name) => allDeptsForTree.find((d) => d.title === name))
      .filter((d): d is NonNullable<typeof d> => d != null)
      .map((d) => ({ department_id: d.department_id, title: d.title }));
    const childOrderExcel = (
      a: { department_id: number; title: string },
      b: { department_id: number; title: string }
    ) => {
      const ai = PAO_MTS_DEPARTMENT_NAMES.indexOf(a.title);
      const bi = PAO_MTS_DEPARTMENT_NAMES.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return (a.title || '').localeCompare(b.title || '');
    };
    const forestExcel = buildDepartmentForest(rootDepts, allDeptsForTree, childOrderExcel);
    const { headerRows: excelHeaderRows, leafDepartmentIds: excelLeafIds } = buildReportHeaderStructure(
      forestExcel,
      selectedLeafIds
    );
    const departmentMap = new Map(allDepartmentsForCalc.map((d) => [d.department_id, d.title]));
    const fieldData = new Map<string, Map<number, number>>();
    const booleanFields = new Set([
      'is_service_investigation', 'is_service_investigation_ib', 'is_service_investigation_bpio',
      'is_service_investigation_bpio_hotline', 'is_service_check', 'is_service_check_ib',
      'is_service_check_bpio', 'is_service_check_bpio_hotline', 'is_verification_activity', 'is_db'
    ]);

    const dateToEndOfDay = new Date(request.dateTo);
    dateToEndOfDay.setHours(23, 59, 59, 999);

    if (request.fieldKeys && request.fieldKeys.length > 0) {
      const defs = request.fieldKeys
        .map((k) => REPORT_FIELDS.find((f) => f.key === k))
        .filter((f): f is NonNullable<typeof f> => f != null);
      for (const def of defs) {
        const dataMap = new Map<number, number>();
        for (const leafId of excelLeafIds) {
          const value = await computeFieldValueByRule(def, leafId, request.dateFrom, dateToEndOfDay, undefined);
          dataMap.set(leafId, value);
        }
        fieldData.set(def.key, dataMap);
      }
    } else if (request.fields && request.fields.length > 0) {
      for (const field of request.fields) {
        const dataMap = new Map<number, number>();
        const isBooleanField = booleanFields.has(field.field);
        for (const leafId of excelLeafIds) {
          let value = 0;
          if (field.entity === 'incident') {
            if (isBooleanField) {
              value = (await Incident.count({
                where: {
                  department_id: leafId,
                  createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                  [field.field]: true,
                } as any,
              })) as number;
            } else {
              const whereOpt = { where: { department_id: leafId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
              value = Number(await Incident.sum(field.field as any, whereOpt)) || 0;
            }
          } else if (field.entity === 'event') {
            if (isBooleanField) {
              value = (await Event.count({
                where: {
                  department_id: leafId,
                  createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                  [field.field]: true,
                } as any,
              })) as number;
            } else {
              const whereOpt = { where: { department_id: leafId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
              value = Number(await Event.sum(field.field as any, whereOpt)) || 0;
            }
          } else if (field.entity === 'operationalActivity') {
            if (isBooleanField) {
              value = (await OperationalActivity.count({
                where: {
                  department_id: leafId,
                  createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                  [field.field]: true,
                } as any,
              })) as number;
            } else {
              const whereOpt = { where: { department_id: leafId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
              value = Number(await OperationalActivity.sum(field.field as any, whereOpt)) || 0;
            }
          }
          dataMap.set(leafId, value);
        }
        fieldData.set(`${field.entity}.${field.field}`, dataMap);
      }
    }

    // Формируем заголовок отчета
    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    const fromMonth = monthNames[fromDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toMonth = monthNames[toDate.getMonth()];
    const toYear = toDate.getFullYear();

    const reportTitle = fromMonth === toMonth && fromYear === toYear
      ? `Результаты работы ${fromMonth} ${fromYear}`
      : `Результаты работы ${fromMonth} ${fromYear} - ${toMonth} ${toYear}`;

    const numLeafCols = excelLeafIds.length;
    const totalCols = 1 + numLeafCols + (allSelectedArePaoMts ? 1 : 2);

    // Заголовок отчёта: заливка, шрифт, границы
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = reportTitle;
    titleRow.getCell(1).font = EXCEL_STYLE.fontTitle;
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    titleRow.getCell(1).fill = EXCEL_STYLE.fillTitle;
    titleRow.getCell(1).border = excelBorder(EXCEL_STYLE.borderThin);
    worksheet.mergeCells(1, 1, 1, Math.max(1, totalCols));
    titleRow.getCell(1).border = {
      ...excelBorder(EXCEL_STYLE.borderThin),
      bottom: EXCEL_STYLE.borderMedium,
    };

    const headerStartRow = 2;
    const numHeaderRows = Math.max(1, excelHeaderRows.length);
    worksheet.mergeCells(headerStartRow, 1, headerStartRow + numHeaderRows - 1, 1);
    const indicatorCell = worksheet.getRow(headerStartRow).getCell(1);
    indicatorCell.value = 'Показатель';
    indicatorCell.font = EXCEL_STYLE.fontHeader;
    indicatorCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    indicatorCell.fill = EXCEL_STYLE.fillHeaderIndicator;
    indicatorCell.border = excelBorder(EXCEL_STYLE.borderThin);

    // Развернуть каждую строку шапки в ячейки с границами (startCol, endCol) для вертикального объединения
    type CellBounds = { label: string; startCol: number; endCol: number };
    const rowCells: CellBounds[][] = excelHeaderRows.map((headerRow) => {
      const cells: CellBounds[] = [];
      let pos = 0;
      for (const cell of headerRow) {
        cells.push({ label: cell.label, startCol: pos, endCol: pos + cell.span });
        pos += cell.span;
      }
      return cells;
    });

    // Записываем значения и считаем вертикальный охват (без merge — иначе «Cannot merge already merged cells»)
    const mergedRanges = new Map<string, { startRow: number; endRow: number; label: string }>();
    for (let r = 0; r < excelHeaderRows.length; r++) {
      const row = worksheet.getRow(headerStartRow + r);
      for (const cell of rowCells[r]) {
        const key = `${cell.startCol}-${cell.endCol}`;
        const prev = mergedRanges.get(key);
        if (prev && prev.label === cell.label && prev.endRow === r - 1) {
          prev.endRow = r;
          continue;
        }
        const excelCol = cell.startCol + 2;
        const c = row.getCell(excelCol);
        c.value = cell.label;
        c.font = EXCEL_STYLE.fontHeader;
        c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        c.fill = EXCEL_STYLE.fillHeader;
        c.border = excelBorder(EXCEL_STYLE.borderThin);
        mergedRanges.set(key, { startRow: r, endRow: r, label: cell.label });
      }
    }
    // Один проход объединения: каждая область — один прямоугольник (строки startRow..endRow, столбцы startCol..endCol)
    for (const [key, { startRow, endRow }] of mergedRanges) {
      const [startCol, endCol] = key.split('-').map(Number);
      const rowSpan = endRow - startRow + 1;
      const colSpan = endCol - startCol;
      if (rowSpan > 1 || colSpan > 1) {
        worksheet.mergeCells(
          headerStartRow + startRow,
          startCol + 2,
          headerStartRow + endRow,
          endCol + 1
        );
      }
    }

    let totalGkCol = 0;
    let totalPaoCol = 0;
    const lastHeaderRow = worksheet.getRow(headerStartRow + numHeaderRows - 1);
    if (!allSelectedArePaoMts) {
      totalGkCol = 2 + numLeafCols;
      totalPaoCol = 3 + numLeafCols;
      const cGk = lastHeaderRow.getCell(totalGkCol);
      cGk.value = 'Итого ГК МТС';
      cGk.font = EXCEL_STYLE.fontHeader;
      cGk.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cGk.fill = EXCEL_STYLE.fillTotal;
      cGk.border = excelBorder(EXCEL_STYLE.borderThin);
      const cPao = lastHeaderRow.getCell(totalPaoCol);
      cPao.value = 'Итого ПАО МТС';
      cPao.font = EXCEL_STYLE.fontHeader;
      cPao.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cPao.fill = EXCEL_STYLE.fillTotal;
      cPao.border = excelBorder(EXCEL_STYLE.borderThin);
    } else {
      totalPaoCol = 2 + numLeafCols;
      const cPao = lastHeaderRow.getCell(totalPaoCol);
      cPao.value = 'Итого ПАО МТС';
      cPao.font = EXCEL_STYLE.fontHeader;
      cPao.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cPao.fill = EXCEL_STYLE.fillTotal;
      cPao.border = excelBorder(EXCEL_STYLE.borderThin);
    }

    const outputFields: Array<{ label: string; dataKey: string }> =
      request.fieldKeys && request.fieldKeys.length > 0
        ? (request.fieldKeys
            .map((k) => REPORT_FIELDS.find((f) => f.key === k))
            .filter((f): f is NonNullable<typeof f> => f != null)
            .map((def) => ({ label: def.label, dataKey: def.key })))
        : (request.fields || []).map((f) => ({ label: f.label, dataKey: `${f.entity}.${f.field}` }));

    let currentRow = headerStartRow + numHeaderRows;

    for (const { label, dataKey } of outputFields) {
      const dataRow = worksheet.getRow(currentRow);
      const indicatorCell = dataRow.getCell(1);
      indicatorCell.value = label;
      indicatorCell.font = EXCEL_STYLE.fontData;
      indicatorCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      indicatorCell.border = excelBorder(EXCEL_STYLE.borderThin);

      let rowTotalGk = 0;
      let rowTotalPao = 0;

      excelLeafIds.forEach((leafId, index) => {
        const value = (fieldData.get(dataKey)?.get(leafId)) ?? 0;
        const cell = dataRow.getCell(index + 2);
        cell.value = value;
        cell.numFmt = '#,##0';
        cell.font = EXCEL_STYLE.fontData;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = excelBorder(EXCEL_STYLE.borderThin);

        rowTotalGk += value;
        if (paoMtsIdsForExcel.has(leafId)) {
          rowTotalPao += value;
        }
      });

      if (!allSelectedArePaoMts && totalGkCol > 0) {
        const rowGkCell = dataRow.getCell(totalGkCol);
        rowGkCell.value = rowTotalGk;
        rowGkCell.numFmt = '#,##0';
        rowGkCell.font = { ...EXCEL_STYLE.fontData, bold: true };
        rowGkCell.alignment = { horizontal: 'right', vertical: 'middle' };
        rowGkCell.fill = EXCEL_STYLE.fillTotal;
        rowGkCell.border = excelBorder(EXCEL_STYLE.borderThin);
      }

      const rowPaoCell = dataRow.getCell(totalPaoCol);
      rowPaoCell.value = rowTotalPao;
      rowPaoCell.numFmt = '#,##0';
      rowPaoCell.font = { ...EXCEL_STYLE.fontData, bold: true };
      rowPaoCell.alignment = { horizontal: 'right', vertical: 'middle' };
      rowPaoCell.fill = EXCEL_STYLE.fillTotal;
      rowPaoCell.border = excelBorder(EXCEL_STYLE.borderThin);

      currentRow++;
    }

    // Ширина столбцов
    worksheet.getColumn(1).width = 58;
    for (let i = 0; i < numLeafCols; i++) {
      worksheet.getColumn(i + 2).width = 14;
    }
    if (!allSelectedArePaoMts && totalGkCol > 0) {
      worksheet.getColumn(totalGkCol).width = 16;
    }
    worksheet.getColumn(totalPaoCol).width = 16;

    // Закрепить заголовок и шапку таблицы при прокрутке
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: headerStartRow + numHeaderRows,
        activeCell: 'A1',
        showGridLines: true,
      },
    ];

    // Генерируем буфер
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  },

  /**
   * Данные таблицы отчётов по полям и департаментам с пагинацией
   */
  async getReportTable(request: TableRequest): Promise<{
    rows: Array<{ fieldName: string; fieldKey: string; [key: string]: string | number }>;
    departments: Array<{ id: number; name: string }>;
    total: number;
    paoMtsDepartmentIds: number[];
    allSelectedArePaoMts?: boolean;
    /** Иерархическая шапка таблицы: массив строк, каждая строка — массив ячеек с label и span */
    headerRows?: ReportHeaderCell[][];
  }> {
    console.log('[reportService.getReportTable] Starting', { page: request.page, limit: request.limit, departmentIds: request.departmentIds });
    const { dateFrom, dateTo, departmentIds, page, limit } = request;
    
    console.log('[reportService.getReportTable] Fetching departments', { departmentIdsCount: departmentIds.length });
    const departments = departmentIds.length > 0
      ? await Department.findAll({ where: { department_id: { [Op.in]: departmentIds } } })
      : await Department.findAll();
    
    // Проверяем сигнал отмены после SQL запроса
    if (request.abortSignal?.aborted) {
      console.log('[reportService.getReportTable] Abort signal detected after fetching departments');
      throw new Error('Request aborted');
    }
    
    console.log('[reportService.getReportTable] Departments fetched:', departments.length, 'IDs:', departments.map(d => d.department_id));
    
    // Функция для получения всех потомков департамента
    console.log('[reportService.getReportTable] Fetching all departments');
    const allDepartments = await Department.findAll();
    
    // Проверяем сигнал отмены после SQL запроса
    if (request.abortSignal?.aborted) {
      console.log('[reportService.getReportTable] Abort signal detected after fetching all departments');
      throw new Error('Request aborted');
    }
    
    console.log('[reportService.getReportTable] All departments fetched:', allDepartments.length);
    const getAllDescendants = (parentId: number): number[] => {
      const result = [parentId];
      const children = allDepartments.filter((d) => d.parent_id === parentId);
      for (const child of children) {
        result.push(...getAllDescendants(child.department_id));
      }
      return result;
    };

    /** Листья поддерева: только самые нижние подразделения (без детей). Отчётность по фактическим данным филиалов. */
    const getLeafDescendants = (parentId: number): number[] => {
      const children = allDepartments.filter((d) => d.parent_id === parentId);
      if (children.length === 0) {
        return [parentId];
      }
      const result: number[] = [];
      for (const child of children) {
        result.push(...getLeafDescendants(child.department_id));
      }
      return result;
    };
    
    // Департаменты ПАО МТС (белый список) — для сортировки и итогов
    const paoMtsIds = new Set<number>(); // Все ID включая потомков - для подсчета total_pao_mts
    const paoMtsMainIds: number[] = []; // Только основные департаменты - для фильтрации
    const paoMtsNameToId = new Map<string, number>();
    
    for (const name of PAO_MTS_DEPARTMENT_NAMES) {
      const dept = allDepartments.find((d) => d.title === name);
      if (dept) {
        // Сохраняем основной департамент
        paoMtsMainIds.push(dept.department_id);
        paoMtsNameToId.set(name, dept.department_id);
        // Добавляем департамент и всех его потомков для подсчета total_pao_mts
        getAllDescendants(dept.department_id).forEach(id => paoMtsIds.add(id));
      }
    }
    
    // Сортируем департаменты по заданному порядку ПАО МТС
    const sortedDepartments = [...departments].sort((a, b) => {
      const aIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === a.department_id || getAllDescendants(id || 0).includes(a.department_id);
      });
      const bIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === b.department_id || getAllDescendants(id || 0).includes(b.department_id);
      });
      
      // Если оба в списке ПАО МТС, сортируем по индексу
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // Если только один в списке, он идет первым
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // Если оба не в списке, сортируем по названию
      return a.title.localeCompare(b.title);
    });
    
    // Проверяем, все ли выбранные департаменты входят в ПАО МТС
    const allSelectedArePaoMts = sortedDepartments.every(dept => paoMtsIds.has(dept.department_id));

    // Дерево от стандартных корней; в отчёт — только листья под выбранными группами (при галке ПАО МТС — все филиалы под КЦ, Москва, Центр и т.д.)
    const allDeptsForTree = allDepartments.map((d) => ({
      department_id: d.department_id,
      title: d.title,
      parent_id: d.parent_id,
    }));
    const selectedLeafIds = new Set(
      sortedDepartments.flatMap((d) => getLeafDescendants(d.department_id))
    );
    const rootDepts = STANDARD_ROOT_NAMES.map((name) => allDeptsForTree.find((d) => d.title === name))
      .filter((d): d is NonNullable<typeof d> => d != null)
      .map((d) => ({ department_id: d.department_id, title: d.title }));
    const childOrder = (
      a: { department_id: number; title: string },
      b: { department_id: number; title: string }
    ) => {
      const ai = PAO_MTS_DEPARTMENT_NAMES.indexOf(a.title);
      const bi = PAO_MTS_DEPARTMENT_NAMES.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return (a.title || '').localeCompare(b.title || '');
    };
    const forest = buildDepartmentForest(rootDepts, allDeptsForTree, childOrder);
    const { headerRows, leafDepartmentIds } = buildReportHeaderStructure(forest, selectedLeafIds);
    const leafDepartments = leafDepartmentIds.map((id) => {
      const d = allDepartments.find((x) => x.department_id === id);
      return { id, name: d?.title ?? `Департамент ${id}` };
    });
    
    const total = REPORT_FIELDS.length;
    const start = (page - 1) * limit;
    const pageFields = REPORT_FIELDS.slice(start, start + limit);
    console.log('[reportService.getReportTable] Processing fields:', pageFields.length, 'from', start, 'to', start + limit);
    const rows: Array<{ fieldName: string; fieldKey: string; [key: string]: string | number }> = [];

    for (let i = 0; i < pageFields.length; i++) {
      const def = pageFields[i];
      console.log(`[reportService.getReportTable] Processing field ${i + 1}/${pageFields.length}: ${def.key}`);
      
      // Проверяем сигнал отмены перед обработкой каждого поля
      if (request.abortSignal?.aborted) {
        console.log(`[reportService.getReportTable] Abort signal detected, stopping computation at field ${def.key}`);
        throw new Error('Request aborted');
      }

      const row: { fieldName: string; fieldKey: string; [key: string]: string | number } = {
        fieldName: def.label,
        fieldKey: def.key,
      };
      
      let totalGkMts = 0;
      let totalPaoMts = 0;

      for (const leafId of leafDepartmentIds) {
        // Проверяем сигнал отмены перед обработкой каждого листа
        if (request.abortSignal?.aborted) {
          console.log(`[reportService.getReportTable] Abort signal detected, stopping computation at leaf ${leafId}`);
          throw new Error('Request aborted');
        }
        const val = await computeFieldValueByRule(def, leafId, dateFrom, dateTo, request.abortSignal);
        if (request.abortSignal?.aborted) {
          console.log(`[reportService.getReportTable] Abort signal detected after computation for leaf ${leafId}`);
          throw new Error('Request aborted');
        }
        row[`dept_${leafId}`] = val;
        totalGkMts += val;
        if (paoMtsIds.has(leafId)) totalPaoMts += val;
      }
      
      // Добавляем total_gk_mts только если не все выбранные департаменты входят в ПАО МТС
      if (!allSelectedArePaoMts) {
        row.total_gk_mts = totalGkMts;
      }
      // total_pao_mts всегда добавляем
      row.total_pao_mts = totalPaoMts;
      
      rows.push(row);
      console.log(`[reportService.getReportTable] Field ${i + 1}/${pageFields.length} completed`);
    }

    console.log('[reportService.getReportTable] All fields processed, returning result');
    const result = {
      rows,
      departments: leafDepartments,
      total,
      paoMtsDepartmentIds: paoMtsMainIds,
      allSelectedArePaoMts,
      headerRows,
    };
    console.log('[reportService.getReportTable] Result prepared:', { rowsCount: rows.length, departmentsCount: result.departments.length, headerRowsCount: headerRows.length });
    return result;
  },

  /**
   * Выгрузка выбранного разреза (поля + департаменты) в Excel
   */
  async exportSelectedReport(request: ExportRequest): Promise<ExcelJS.Buffer> {
    const { dateFrom, dateTo, departmentIds, fieldKeys } = request;
    const validKeys = fieldKeys.filter((k) => REPORT_FIELDS.some((f) => f.key === k));
    if (validKeys.length === 0) {
      throw new Error('Не найдено полей для выгрузки');
    }
    return this.generateReport({
      dateFrom,
      dateTo,
      departmentIds,
      fieldKeys: validKeys,
    });
  },

  /**
   * Выгрузка дашборда в Excel: один столбчатый график (месяцы × показатели) + N круговых (по одному на показатель, группировка по 2-му уровню департаментов).
   * Таблицу в файл не включаем.
   */
  async exportDashboard(request: ExportRequest): Promise<Buffer> {
    const { dateFrom, dateTo, departmentIds, fieldKeys } = request;
    const validKeys = fieldKeys.filter((k) => REPORT_FIELDS.some((f) => f.key === k));
    if (validKeys.length === 0) {
      throw new Error('Не найдено полей для выгрузки');
    }

    const departments = await Department.findAll({
      where: { department_id: { [Op.in]: departmentIds } },
    });
    const allDepartmentsForCalc = await Department.findAll();
    const getAllDescendants = (parentId: number): number[] => {
      const result = [parentId];
      const children = allDepartmentsForCalc.filter((d) => d.parent_id === parentId);
      for (const child of children) {
        result.push(...getAllDescendants(child.department_id));
      }
      return result;
    };
    const getLeafDescendants = (parentId: number): number[] => {
      const children = allDepartmentsForCalc.filter((d) => d.parent_id === parentId);
      if (children.length === 0) return [parentId];
      const result: number[] = [];
      for (const child of children) {
        result.push(...getLeafDescendants(child.department_id));
      }
      return result;
    };

    const paoMtsNameToId = new Map<string, number>();
    for (const name of PAO_MTS_DEPARTMENT_NAMES) {
      const dept = allDepartmentsForCalc.find((d) => d.title === name);
      if (dept) {
        paoMtsNameToId.set(name, dept.department_id);
      }
    }
    const sortedDepartments = [...departments].sort((a, b) => {
      const aIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex((name) => {
        const id = paoMtsNameToId.get(name);
        return id != null && (a.department_id === id || getAllDescendants(id).includes(a.department_id));
      });
      const bIndex = PAO_MTS_DEPARTMENT_NAMES.findIndex((name) => {
        const id = paoMtsNameToId.get(name);
        return id != null && (b.department_id === id || getAllDescendants(id).includes(b.department_id));
      });
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.title.localeCompare(b.title);
    });

    const allDeptsForTree = allDepartmentsForCalc.map((d) => ({
      department_id: d.department_id,
      title: d.title,
      parent_id: d.parent_id,
    }));
    const selectedLeafIds = new Set(
      sortedDepartments.flatMap((d) => getLeafDescendants(d.department_id))
    );
    const rootDepts = STANDARD_ROOT_NAMES.map((name) => allDeptsForTree.find((d) => d.title === name))
      .filter((d): d is NonNullable<typeof d> => d != null)
      .map((d) => ({ department_id: d.department_id, title: d.title }));
    const childOrder = (
      a: { department_id: number; title: string },
      b: { department_id: number; title: string }
    ) => {
      const ai = PAO_MTS_DEPARTMENT_NAMES.indexOf(a.title);
      const bi = PAO_MTS_DEPARTMENT_NAMES.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return (a.title || '').localeCompare(b.title || '');
    };
    const forest = buildDepartmentForest(rootDepts, allDeptsForTree, childOrder);
    const { leafDepartmentIds: excelLeafIds } = buildReportHeaderStructure(forest, selectedLeafIds);

    const defs = validKeys
      .map((k) => REPORT_FIELDS.find((f) => f.key === k))
      .filter((f): f is NonNullable<typeof f> => f != null);
    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
    ];

    // Месяцы в диапазоне
    const months: Array<{ label: string; dateFrom: Date; dateTo: Date }> = [];
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    let y = from.getFullYear();
    let m = from.getMonth();
    const endY = to.getFullYear();
    const endM = to.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      const monthStart = new Date(y, m, 1);
      const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
      months.push({
        label: `${monthNames[m]} ${y}`,
        dateFrom: monthStart,
        dateTo: monthEnd,
      });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }

    // Данные для столбчатого графика: по месяцам, суммы по каждому показателю
    const columnData: Record<string, Record<string, number>> = {};
    for (const month of months) {
      const row: Record<string, number> = {};
      for (const def of defs) {
        let sum = 0;
        for (const leafId of excelLeafIds) {
          const v = await computeFieldValueByRule(def, leafId, month.dateFrom, month.dateTo, undefined);
          sum += v;
        }
        row[def.label] = sum;
      }
      columnData[month.label] = row;
    }

    // Данные для круговых: полный период по листьям, затем группировка по 2-му уровню (или 1-му при двух уровнях)
    const leafPaths = getLeafPaths(forest, selectedLeafIds);
    const leafToGroup = new Map<number, string>();
    for (const { leafId, path } of leafPaths) {
      const groupLabel = path.length >= 2 ? path[1] : path[0];
      leafToGroup.set(leafId, groupLabel);
    }

    const fieldDataByLeaf = new Map<string, Map<number, number>>();
    const dateToEnd = new Date(dateTo);
    dateToEnd.setHours(23, 59, 59, 999);
    for (const def of defs) {
      const dataMap = new Map<number, number>();
      for (const leafId of excelLeafIds) {
        const value = await computeFieldValueByRule(def, leafId, dateFrom, dateToEnd, undefined);
        dataMap.set(leafId, value);
      }
      fieldDataByLeaf.set(def.key, dataMap);
    }

    const pieDataByField: Array<{ label: string; data: Record<string, Record<string, number>> }> = [];
    for (const def of defs) {
      const groupSums: Record<string, number> = {};
      for (const leafId of excelLeafIds) {
        const groupLabel = leafToGroup.get(leafId) ?? 'Прочее';
        const value = fieldDataByLeaf.get(def.key)?.get(leafId) ?? 0;
        groupSums[groupLabel] = (groupSums[groupLabel] ?? 0) + value;
      }
      pieDataByField.push({
        label: def.label,
        data: { [def.label]: groupSums },
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Дашборд', { properties: { defaultRowHeight: 15 } });

    const rowHeight = 15;
    const gapRows = 2;
    let rowPos = 0;

    // Ограничиваем число показателей в столбчатом графике, иначе QuickChart 400 (лимит запроса)
    const columnDefs = defs.length > COLUMN_CHART_MAX_DATASETS ? defs.slice(0, COLUMN_CHART_MAX_DATASETS) : defs;
    const columnDefsNote = defs.length > COLUMN_CHART_MAX_DATASETS ? ` (показаны первые ${COLUMN_CHART_MAX_DATASETS} из ${defs.length})` : '';

    // Динамические размеры: по ширине — под много месяцев и показателей, по высоте — под легенду вниз
    const columnChartBaseWidth = 1000;
    const columnChartBaseHeight = 480;
    const columnChartWidth = Math.min(
      QUICKCHART_MAX_WIDTH,
      columnChartBaseWidth
        + Math.max(0, months.length - 12) * 90
        + Math.max(0, columnDefs.length - 25) * 28
    );
    const columnChartHeight = Math.min(QUICKCHART_MAX_HEIGHT, columnChartBaseHeight + Math.max(0, columnDefs.length - 25) * 22);

    // Столбчатый график (месяцы × показатели)
    const columnChartConfig = {
      type: 'bar',
      data: {
        labels: months.map((m) => m.label),
        datasets: columnDefs.map((d) => ({
          label: d.label,
          data: months.map((m) => columnData[m.label]?.[d.label] ?? 0),
        })),
      },
      options: {
        title: {
          display: true,
          text: (months.length ? `Суммы за период ${months[0].label} — ${months[months.length - 1].label}` : 'По месяцам') + columnDefsNote,
          font: { size: 16 },
        },
        legend: { display: true, labels: { font: { size: 12 } } },
        scales: {
          xAxes: [{ stacked: false, ticks: { font: { size: 11 }, maxRotation: 45 } }],
          yAxes: [{ stacked: false, ticks: { font: { size: 11 } } }],
        },
      },
    };
    const columnPng = await getChartPng(columnChartConfig, columnChartWidth, columnChartHeight);
    const columnImageId = workbook.addImage({ base64: columnPng.toString('base64'), extension: 'png' });
    sheet.addImage(columnImageId, {
      tl: { col: 0, row: rowPos },
      ext: { width: columnChartWidth, height: columnChartHeight },
      editAs: 'oneCell',
    });
    rowPos += columnChartHeight / rowHeight + gapRows;

    // Круговые диаграммы — по 4 в строку с небольшим отступом, фиксированный размер
    const pieSize = 420;
    const piesPerRow = 4;
    const colStep = 9.2;
    let colPos = 0;
    for (const { label, data } of pieDataByField) {
      const fields = Object.keys(data[label] || {});
      if (fields.length === 0) continue;
      let pieLabels: string[];
      let pieValues: number[];
      const values = fields.map((f) => data[label][f] ?? 0);
      const total = values.reduce((a, b) => a + b, 0);
      if (total === 0) {
        pieLabels = ['Нет данных'];
        pieValues = [1];
      } else {
        pieLabels = fields;
        pieValues = values;
      }
      // Конфиг строкой — чтобы formatter (проценты) работал в QuickChart
      const pieConfigStr = `{
        type: 'pie',
        data: { labels: ${JSON.stringify(pieLabels)}, datasets: [{ data: ${JSON.stringify(pieValues)} }] },
        options: {
          title: { display: true, text: ${JSON.stringify(label)}, font: { size: 14 } },
          legend: { display: true, labels: { font: { size: 13 } } },
          plugins: {
            datalabels: {
              color: '#ffffff',
              font: { weight: 'bold', size: 13 },
              formatter: function(value, ctx) {
                var total = ctx.dataset.data.reduce(function(a,b){ return a+b; }, 0);
                return total > 0 ? (value/total*100).toFixed(1) + '%' : '0%';
              }
            }
          }
        }
      }`;
      const piePng = await getChartPng(pieConfigStr, pieSize, pieSize);
      const pieImageId = workbook.addImage({ base64: piePng.toString('base64'), extension: 'png' });
      sheet.addImage(pieImageId, {
        tl: { col: colPos * colStep, row: rowPos },
        ext: { width: pieSize, height: pieSize },
        editAs: 'oneCell',
      });
      colPos++;
      if (colPos >= piesPerRow) {
        colPos = 0;
        rowPos += pieSize / rowHeight + gapRows;
      }
    }

    sheet.getColumn(1).width = 24;
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  },
};
