/**
 * Verify full sample Excel against DB leaves + REPORT_FIELDS.
 */
import ExcelJS from 'exceljs';
import { Department } from '../models';
import { REPORT_FIELDS, normalizeReportLabel } from '../constants/reportFields';

const STANDARD_ROOT_NAMES = ['КЦ', 'ЕЦКБ', 'ДЗК', 'ФО'];
const PAO = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];

async function main() {
  const filePath = process.argv[2] || '/samples/sample_report_rp053_full_template.xlsx';
  const all = await Department.findAll();
  const rows = all.map((d) => ({
    id: d.department_id,
    title: d.title as string,
    parent_id: d.parent_id as number | null,
  }));

  const getLeaves = (parentId: number): number[] => {
    const ch = rows.filter((d) => d.parent_id === parentId);
    if (!ch.length) return [parentId];
    return ch.flatMap((c) => getLeaves(c.id));
  };

  const expectedLeafIds = new Set<number>();
  for (const name of STANDARD_ROOT_NAMES) {
    const root = rows.find((d) => d.title === name);
    if (root) getLeaves(root.id).forEach((id) => expectedLeafIds.add(id));
  }
  const expectedLeafTitles = [...expectedLeafIds]
    .map((id) => rows.find((d) => d.id === id)!.title)
    .sort((a, b) => a.localeCompare(b, 'ru'));

  const paoLeafIds = new Set<number>();
  for (const name of PAO) {
    const root = rows.find((d) => d.title === name);
    if (root) getLeaves(root.id).forEach((id) => paoLeafIds.add(id));
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.getWorksheet('Отчет') || wb.worksheets[0];
  if (!ws) throw new Error('No worksheet');

  const labelSet = new Map(REPORT_FIELDS.map((f) => [normalizeReportLabel(f.label), f]));
  let indicatorRow = 0;
  let dataStart = 0;
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    const a = normalizeReportLabel(String(row.getCell(1).value ?? ''));
    if (a === normalizeReportLabel('Показатель') && !indicatorRow) indicatorRow = n;
    if (!dataStart && labelSet.has(a)) dataStart = n;
  });
  const leafHeaderRow = Math.max(indicatorRow, dataStart - 1);

  let maxCol = 1;
  for (let r = indicatorRow; r < dataStart; r++) {
    ws.getRow(r).eachCell({ includeEmpty: false }, (_c, n) => {
      if (n > maxCol) maxCol = n;
    });
  }

  const colTitles: string[] = [];
  for (let col = 2; col <= maxCol; col++) {
    let title = String(ws.getRow(leafHeaderRow).getCell(col).value ?? '').trim();
    if (!title) {
      for (let hr = leafHeaderRow - 1; hr >= indicatorRow; hr--) {
        const t = String(ws.getRow(hr).getCell(col).value ?? '').trim();
        if (t) {
          title = t;
          break;
        }
      }
    }
    if (title) colTitles.push(title);
  }

  const totals = colTitles.filter((t) => /^итого/i.test(t));
  const deptCols = colTitles.filter((t) => !/^итого/i.test(t));

  const fileLabels: string[] = [];
  const end = ws.rowCount || dataStart + 300;
  for (let r = dataStart; r <= end; r++) {
    const label = String(ws.getRow(r).getCell(1).value ?? '').trim();
    if (label) fileLabels.push(label);
  }

  const expectedLabels = REPORT_FIELDS.map((f) => f.label);
  const missingLabels = expectedLabels.filter((l) => !fileLabels.includes(l));
  const extraLabels = fileLabels.filter((l) => !expectedLabels.includes(l));
  const orderOk =
    fileLabels.length === expectedLabels.length &&
    fileLabels.every((l, i) => l === expectedLabels[i]);

  const missingDepts = expectedLeafTitles.filter((t) => !deptCols.includes(t));
  const extraDepts = deptCols.filter((t) => !expectedLeafTitles.includes(t));
  const dupDepts = deptCols.filter((t, i) => deptCols.indexOf(t) !== i);

  const ok =
    missingDepts.length === 0 &&
    extraDepts.length === 0 &&
    missingLabels.length === 0 &&
    extraLabels.length === 0 &&
    orderOk &&
    dupDepts.length === 0 &&
    totals.includes('Итого ГК МТС') &&
    totals.includes('Итого ПАО МТС');

  console.log(
    JSON.stringify(
      {
        filePath,
        ok,
        sheet: ws.name,
        indicatorRow,
        dataStart,
        headerLevels: dataStart - indicatorRow,
        fileDeptColumns: deptCols.length,
        expectedLeavesUnderRoots: expectedLeafTitles.length,
        paoLeavesOnly: paoLeafIds.size,
        totalsColumns: totals,
        missingDepartments: missingDepts,
        extraDepartments: extraDepts,
        duplicateDeptCols: dupDepts,
        metricRowsInFile: fileLabels.length,
        expectedMetrics: expectedLabels.length,
        missingMetrics: missingLabels,
        extraMetrics: extraLabels,
        metricsExactOrder: orderOk,
        sampleFirstDepts: deptCols.slice(0, 10),
        sampleLastDepts: deptCols.slice(-10),
      },
      null,
      2
    )
  );

  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
