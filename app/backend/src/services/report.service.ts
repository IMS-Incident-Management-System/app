import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Incident, Event, OperationalActivity, Department } from '../models';
import { REPORT_FIELDS } from '../constants/reportFields';
import { computeFieldValueByRule } from './reportCalculator';

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
 */
export function buildReportHeaderStructure(
  forest: DeptTreeNode[]
): { headerRows: ReportHeaderCell[][]; leafDepartmentIds: number[] } {
  /** Для каждого листа в порядке обхода: путь от корня до родителя (включительно). path[0]=root, path[path.length-1]=parent. */
  const leafPaths: Array<{ leafId: number; leafTitle: string; path: string[] }> = [];

  function traverse(node: DeptTreeNode, pathFromRoot: string[]): void {
    if (node.children.length === 0) {
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
  for (let d = 0; d < maxDepth; d++) {
    const labels = leafPaths.map((p) => (d < p.path.length ? p.path[d] : p.path[p.path.length - 1]));
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
    
    // Определяем департаменты ПАО МТС (белый список) в заданном порядке
    const paoMtsDepartmentNames = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];
    const paoMtsIdsForExcel = new Set<number>();
    const paoMtsNameToId = new Map<string, number>();
    
    for (const name of paoMtsDepartmentNames) {
      const dept = allDepartmentsForCalc.find((d) => d.title === name);
      if (dept) {
        paoMtsNameToId.set(name, dept.department_id);
        getAllDescendants(dept.department_id).forEach(id => paoMtsIdsForExcel.add(id));
      }
    }
    
    // Сортируем департаменты по заданному порядку ПАО МТС
    const sortedDepartments = [...departments].sort((a, b) => {
      const aIndex = paoMtsDepartmentNames.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === a.department_id || getAllDescendants(id || 0).includes(a.department_id);
      });
      const bIndex = paoMtsDepartmentNames.findIndex(name => {
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

    // Дерево и иерархическая шапка: столбцы данных — листья (корни только те выбранные, у которых родитель не выбран — без дубликатов листьев)
    const allDeptsForTree = allDepartmentsForCalc.map((d) => ({
      department_id: d.department_id,
      title: d.title,
      parent_id: d.parent_id,
    }));
    const selectedIds = new Set(sortedDepartments.map((d) => d.department_id));
    const rootDepts = sortedDepartments
      .filter((d) => {
        const parentId = allDeptsForTree.find((x) => x.department_id === d.department_id)?.parent_id ?? null;
        return parentId == null || !selectedIds.has(parentId);
      })
      .map((d) => ({ department_id: d.department_id, title: d.title }));
    const childOrderExcel = (
      a: { department_id: number; title: string },
      b: { department_id: number; title: string }
    ) => {
      const ai = paoMtsDepartmentNames.indexOf(a.title);
      const bi = paoMtsDepartmentNames.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return (a.title || '').localeCompare(b.title || '');
    };
    const forestExcel = buildDepartmentForest(rootDepts, allDeptsForTree, childOrderExcel);
    const { headerRows: excelHeaderRows, leafDepartmentIds: excelLeafIds } = buildReportHeaderStructure(forestExcel);
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

    // Заголовок отчета
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = reportTitle;
    titleRow.getCell(1).font = { size: 18, bold: true };
    const numLeafCols = excelLeafIds.length;
    const totalCols = 1 + numLeafCols + (allSelectedArePaoMts ? 1 : 2);
    worksheet.mergeCells(1, 1, 1, Math.max(1, totalCols));

    const headerStartRow = 2;
    const numHeaderRows = Math.max(1, excelHeaderRows.length);
    worksheet.mergeCells(headerStartRow, 1, headerStartRow + numHeaderRows - 1, 1);
    worksheet.getRow(headerStartRow).getCell(1).value = 'Показатель';
    worksheet.getRow(headerStartRow).getCell(1).font = { bold: true };
    worksheet.getRow(headerStartRow).getCell(1).alignment = { vertical: 'middle' };

    let col = 2;
    for (let r = 0; r < excelHeaderRows.length; r++) {
      const row = worksheet.getRow(headerStartRow + r);
      for (const cell of excelHeaderRows[r]) {
        if (cell.span > 1) {
          worksheet.mergeCells(headerStartRow + r, col, headerStartRow + r, col + cell.span - 1);
        }
        row.getCell(col).value = cell.label;
        row.getCell(col).font = { bold: true };
        col += cell.span;
      }
      col = 2;
    }

    let totalGkCol = 0;
    let totalPaoCol = 0;
    if (!allSelectedArePaoMts) {
      totalGkCol = 2 + numLeafCols;
      totalPaoCol = 3 + numLeafCols;
      const lastHeaderRow = worksheet.getRow(headerStartRow + numHeaderRows - 1);
      lastHeaderRow.getCell(totalGkCol).value = 'Итого ГК МТС';
      lastHeaderRow.getCell(totalGkCol).font = { bold: true };
      lastHeaderRow.getCell(totalPaoCol).value = 'Итого ПАО МТС';
      lastHeaderRow.getCell(totalPaoCol).font = { bold: true };
    } else {
      totalPaoCol = 2 + numLeafCols;
      const lastHeaderRow = worksheet.getRow(headerStartRow + numHeaderRows - 1);
      lastHeaderRow.getCell(totalPaoCol).value = 'Итого ПАО МТС';
      lastHeaderRow.getCell(totalPaoCol).font = { bold: true };
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
      dataRow.getCell(1).value = label;
      
      let rowTotalGk = 0;
      let rowTotalPao = 0;
      
      excelLeafIds.forEach((leafId, index) => {
        const value = (fieldData.get(dataKey)?.get(leafId)) ?? 0;
        const cell = dataRow.getCell(index + 2);
        cell.value = value;
        cell.numFmt = '#,##0';
        
        rowTotalGk += value;
        if (paoMtsIdsForExcel.has(leafId)) {
          rowTotalPao += value;
        }
      });
      
      // Добавляем итоговые столбцы для каждой строки
      if (!allSelectedArePaoMts && totalGkCol > 0) {
        const rowGkCell = dataRow.getCell(totalGkCol);
        rowGkCell.value = rowTotalGk;
        rowGkCell.numFmt = '#,##0';
        rowGkCell.font = { bold: true };
        rowGkCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };
      }
      
      // Столбец "Итого ПАО МТС" всегда отображается
      const rowPaoCell = dataRow.getCell(totalPaoCol);
      rowPaoCell.value = rowTotalPao;
      rowPaoCell.numFmt = '#,##0';
      rowPaoCell.font = { bold: true };
      rowPaoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };
      
      currentRow++;
    }

    // Настраиваем ширину столбцов
    worksheet.getColumn(1).width = 60;
    for (let i = 0; i < numLeafCols; i++) {
      worksheet.getColumn(i + 2).width = 20;
    }
    // Настраиваем ширину итоговых столбцов
    if (!allSelectedArePaoMts && totalGkCol > 0) {
      worksheet.getColumn(totalGkCol).width = 20;
    }
    // Столбец "Итого ПАО МТС" всегда есть
    worksheet.getColumn(totalPaoCol).width = 20;

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
    
    // Определяем департаменты ПАО МТС (белый список) в заданном порядке
    const paoMtsDepartmentNames = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];
    const paoMtsIds = new Set<number>(); // Все ID включая потомков - для подсчета total_pao_mts
    const paoMtsMainIds: number[] = []; // Только основные департаменты - для фильтрации
    const paoMtsNameToId = new Map<string, number>(); // Маппинг названий на ID для сортировки
    
    for (const name of paoMtsDepartmentNames) {
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
      const aIndex = paoMtsDepartmentNames.findIndex(name => {
        const id = paoMtsNameToId.get(name);
        return id === a.department_id || getAllDescendants(id || 0).includes(a.department_id);
      });
      const bIndex = paoMtsDepartmentNames.findIndex(name => {
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

    // Дерево департаментов и иерархическая шапка: корни — только «верхнеуровневые» выбранные (родитель не выбран), столбцы данных — листья без дубликатов
    const allDeptsForTree = allDepartments.map((d) => ({
      department_id: d.department_id,
      title: d.title,
      parent_id: d.parent_id,
    }));
    const selectedIds = new Set(sortedDepartments.map((d) => d.department_id));
    const rootDepts = sortedDepartments
      .filter((d) => {
        const parentId = allDeptsForTree.find((x) => x.department_id === d.department_id)?.parent_id ?? null;
        return parentId == null || !selectedIds.has(parentId);
      })
      .map((d) => ({ department_id: d.department_id, title: d.title }));
    const childOrder = (
      a: { department_id: number; title: string },
      b: { department_id: number; title: string }
    ) => {
      const ai = paoMtsDepartmentNames.indexOf(a.title);
      const bi = paoMtsDepartmentNames.indexOf(b.title);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return (a.title || '').localeCompare(b.title || '');
    };
    const forest = buildDepartmentForest(rootDepts, allDeptsForTree, childOrder);
    const { headerRows, leafDepartmentIds } = buildReportHeaderStructure(forest);
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
};
