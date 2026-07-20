/**
 * Round-trip smoke: CurrentExportParser canParse + label map covers REPORT_FIELDS.
 * Run: npx ts-node src/scripts/testReportImportParser.ts
 */
import ExcelJS from 'exceljs';
import { REPORT_FIELDS } from '../constants/reportFields';
import { currentExportParser } from '../services/reportImport/currentExportParser';
import { cellAddress } from '../services/reportImport/types';

async function main() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Отчет');
  ws.getCell(1, 1).value = 'Результаты работы январь 2025';
  ws.getCell(2, 1).value = 'Показатель';
  ws.getCell(2, 2).value = 'Москва';
  ws.getCell(2, 3).value = 'Итого ПАО МТС';

  let row = 3;
  for (const def of REPORT_FIELDS.slice(0, 5)) {
    ws.getCell(row, 1).value = def.label;
    ws.getCell(row, 2).value = row * 10;
    ws.getCell(row, 3).value = row * 10;
    row += 1;
  }

  if (!currentExportParser.canParse(wb)) {
    throw new Error('canParse failed for synthetic workbook');
  }

  const leafMap = new Map<string, number[]>([['москва', [42]]]);
  const result = currentExportParser.parse(wb, { leafDepartmentsByTitle: leafMap });

  if (result.validation.metricsRecognized < 5) {
    throw new Error(`Expected 5 metrics, got ${result.validation.metricsRecognized}`);
  }
  if (result.facts.length < 5) {
    throw new Error(`Expected >=5 facts, got ${result.facts.length}`);
  }
  const withAddr = result.facts.every((f) => /^[A-Z]+\d+$/.test(f.excelAddress));
  if (!withAddr) {
    throw new Error('excel_address missing or invalid');
  }
  // address helper smoke
  if (cellAddress(3, 2) !== 'B3') {
    throw new Error(`cellAddress expected B3 got ${cellAddress(3, 2)}`);
  }

  console.log('OK', {
    facts: result.facts.length,
    metrics: result.validation.metricsRecognized,
    sample: result.facts[0],
    fieldCount: REPORT_FIELDS.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
