/**
 * Полный пример Excel-отчёта для клиента: все листья департаментов + все 160 показателей.
 * Формат = текущая выгрузка (лист «Отчет»), значения = 0.
 *
 * Run inside backend container:
 *   node ./node_modules/ts-node/dist/bin.js src/scripts/generateFullSampleReport.ts
 */
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Department } from '../models';
import { REPORT_FIELDS } from '../constants/reportFields';
import { buildReportHeaderStructure } from '../services/report.service';

const STANDARD_ROOT_NAMES = ['КЦ', 'ЕЦКБ', 'ДЗК', 'ФО'];
const PAO_MTS_DEPARTMENT_NAMES = [
  'КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ',
];

const EXCEL_STYLE = {
  borderThin: { style: 'thin' as const, color: { argb: 'FFB0B0B0' } },
  fillTitle: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF2E5090' } },
  fillHeader: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD6DCE4' } },
  fillHeaderIndicator: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE2E6EB' } },
  fillTotal: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF0F0F0' } },
  fontTitle: { size: 16, bold: true, color: { argb: 'FFFFFFFF' } },
  fontHeader: { size: 10, bold: true, color: { argb: 'FF1A1A1A' } },
  fontData: { size: 10, color: { argb: 'FF000000' } },
};

function excelBorder() {
  const s = EXCEL_STYLE.borderThin;
  return { top: s, left: s, bottom: s, right: s };
}

function buildDepartmentForest(
  rootDepts: Array<{ department_id: number; title: string }>,
  allDepartments: Array<{ department_id: number; title: string; parent_id: number | null }>,
  childOrder: (a: { department_id: number; title: string }, b: { department_id: number; title: string }) => number
) {
  const byId = new Map(allDepartments.map((d) => [d.department_id, d]));
  function buildNode(departmentId: number): {
    departmentId: number;
    title: string;
    children: ReturnType<typeof buildNode>[];
  } {
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

async function main() {
  const allDepts = await Department.findAll();
  const allDeptsForTree = allDepts.map((d) => ({
    department_id: d.department_id,
    title: d.title,
    parent_id: d.parent_id,
  }));

  const getLeafDescendants = (parentId: number): number[] => {
    const children = allDeptsForTree.filter((d) => d.parent_id === parentId);
    if (children.length === 0) return [parentId];
    return children.flatMap((c) => getLeafDescendants(c.department_id));
  };

  // Все листья под стандартными корнями отчёта (полный срез как live без фильтра)
  const rootDepts = STANDARD_ROOT_NAMES.map((name) => allDeptsForTree.find((d) => d.title === name))
    .filter((d): d is NonNullable<typeof d> => d != null)
    .map((d) => ({ department_id: d.department_id, title: d.title }));

  const selectedLeafIds = new Set<number>();
  for (const root of rootDepts) {
    getLeafDescendants(root.department_id).forEach((id) => selectedLeafIds.add(id));
  }

  const childOrder = (
    a: { department_id: number; title: string },
    b: { department_id: number; title: string }
  ) => {
    const ai = PAO_MTS_DEPARTMENT_NAMES.indexOf(a.title);
    const bi = PAO_MTS_DEPARTMENT_NAMES.indexOf(b.title);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return (a.title || '').localeCompare(b.title || '', 'ru');
  };

  const forest = buildDepartmentForest(rootDepts, allDeptsForTree, childOrder);
  const { headerRows, leafDepartmentIds } = buildReportHeaderStructure(forest, selectedLeafIds);
  const leafTitles = leafDepartmentIds.map(
    (id) => allDepts.find((d) => d.department_id === id)?.title ?? `id=${id}`
  );

  console.log('Roots:', rootDepts.map((r) => r.title).join(', '));
  console.log('Leaf columns:', leafDepartmentIds.length);
  console.log('Metric rows:', REPORT_FIELDS.length);
  console.log('Header levels:', headerRows.length);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Отчет');

  const numLeafCols = leafDepartmentIds.length;
  const totalCols = 1 + numLeafCols + 2; // + Итого ГК + Итого ПАО

  const titleRow = worksheet.getRow(1);
  titleRow.getCell(1).value = 'Результаты работы январь 2025';
  titleRow.getCell(1).font = EXCEL_STYLE.fontTitle;
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titleRow.getCell(1).fill = EXCEL_STYLE.fillTitle;
  worksheet.mergeCells(1, 1, 1, totalCols);

  const headerStartRow = 2;
  const numHeaderRows = Math.max(1, headerRows.length);
  worksheet.mergeCells(headerStartRow, 1, headerStartRow + numHeaderRows - 1, 1);
  const indicatorCell = worksheet.getRow(headerStartRow).getCell(1);
  indicatorCell.value = 'Показатель';
  indicatorCell.font = EXCEL_STYLE.fontHeader;
  indicatorCell.fill = EXCEL_STYLE.fillHeaderIndicator;
  indicatorCell.border = excelBorder();
  indicatorCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

  type CellBounds = { label: string; startCol: number; endCol: number };
  const rowCells: CellBounds[][] = headerRows.map((headerRow) => {
    const cells: CellBounds[] = [];
    let pos = 0;
    for (const cell of headerRow) {
      cells.push({ label: cell.label, startCol: pos, endCol: pos + cell.span });
      pos += cell.span;
    }
    return cells;
  });

  const mergedRanges = new Map<string, { startRow: number; endRow: number; label: string }>();
  for (let r = 0; r < headerRows.length; r++) {
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
      c.border = excelBorder();
      mergedRanges.set(key, { startRow: r, endRow: r, label: cell.label });
    }
  }
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

  const lastHeaderRow = worksheet.getRow(headerStartRow + numHeaderRows - 1);
  const totalGkCol = 2 + numLeafCols;
  const totalPaoCol = 3 + numLeafCols;
  for (const [col, label] of [
    [totalGkCol, 'Итого ГК МТС'],
    [totalPaoCol, 'Итого ПАО МТС'],
  ] as const) {
    const c = lastHeaderRow.getCell(col);
    c.value = label;
    c.font = EXCEL_STYLE.fontHeader;
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.fill = EXCEL_STYLE.fillTotal;
    c.border = excelBorder();
  }

  // PAO leaf set for totals
  const paoLeafIds = new Set<number>();
  for (const name of PAO_MTS_DEPARTMENT_NAMES) {
    const dept = allDeptsForTree.find((d) => d.title === name);
    if (dept) getLeafDescendants(dept.department_id).forEach((id) => paoLeafIds.add(id));
  }

  let currentRow = headerStartRow + numHeaderRows;
  for (const def of REPORT_FIELDS) {
    const dataRow = worksheet.getRow(currentRow);
    const a = dataRow.getCell(1);
    a.value = def.label;
    a.font = EXCEL_STYLE.fontData;
    a.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    a.border = excelBorder();

    let totalGk = 0;
    let totalPao = 0;
    leafDepartmentIds.forEach((leafId, index) => {
      const value = 0; // шаблон для клиента
      const cell = dataRow.getCell(index + 2);
      cell.value = value;
      cell.numFmt = '#,##0';
      cell.font = EXCEL_STYLE.fontData;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.border = excelBorder();
      totalGk += value;
      if (paoLeafIds.has(leafId)) totalPao += value;
    });

    for (const [col, val] of [
      [totalGkCol, totalGk],
      [totalPaoCol, totalPao],
    ] as const) {
      const cell = dataRow.getCell(col);
      cell.value = val;
      cell.numFmt = '#,##0';
      cell.font = { ...EXCEL_STYLE.fontData, bold: true };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.fill = EXCEL_STYLE.fillTotal;
      cell.border = excelBorder();
    }
    currentRow++;
  }

  worksheet.getColumn(1).width = 58;
  for (let i = 0; i < numLeafCols; i++) worksheet.getColumn(i + 2).width = 14;
  worksheet.getColumn(totalGkCol).width = 16;
  worksheet.getColumn(totalPaoCol).width = 16;
  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerStartRow + numHeaderRows,
      activeCell: 'A1',
      showGridLines: true,
    },
  ];

  const outDir = path.resolve(process.cwd(), '..', 'samples');
  // In docker cwd is /app; samples may be outside — also write to /app/uploads and /tmp
  const candidates = [
    outDir,
    path.resolve(process.cwd(), 'samples'),
    '/app/uploads',
    '/tmp',
  ];
  let written = '';
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, 'sample_report_rp053_full_template.xlsx');
      await workbook.xlsx.writeFile(filePath);
      written = filePath;
      break;
    } catch (e) {
      console.warn('Cannot write to', dir, (e as Error).message);
    }
  }

  // Also dump leaf list for verification
  const manifest = {
    title: 'Результаты работы январь 2025',
    roots: rootDepts.map((r) => r.title),
    leafCount: leafDepartmentIds.length,
    leafTitles,
    metricCount: REPORT_FIELDS.length,
    metrics: REPORT_FIELDS.map((f) => ({ key: f.key, metricKey: f.metricKey, label: f.label })),
  };
  if (written) {
    const manifestPath = written.replace(/\.xlsx$/, '.manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Wrote', written);
    console.log('Manifest', manifestPath);
  } else {
    throw new Error('Failed to write sample file to any path');
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
