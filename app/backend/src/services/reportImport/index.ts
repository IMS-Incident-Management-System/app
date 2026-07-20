import ExcelJS from 'exceljs';
import { currentExportParser } from './currentExportParser';
import { ParseContext, ParseResult, ReportImportParser } from './types';

const PARSERS: ReportImportParser[] = [currentExportParser];

export function selectReportImportParser(workbook: ExcelJS.Workbook): ReportImportParser | null {
  return PARSERS.find((p) => p.canParse(workbook)) ?? null;
}

export function parseReportWorkbook(workbook: ExcelJS.Workbook, ctx: ParseContext): ParseResult {
  const parser = selectReportImportParser(workbook);
  if (!parser) {
    return {
      facts: [],
      validation: {
        parserId: 'none',
        metricsRecognized: 0,
        metricsUnrecognized: [],
        departmentsRecognized: 0,
        departmentsUnrecognized: [],
        factsCount: 0,
        warnings: ['Не найден подходящий парсер для файла Excel'],
      },
    };
  }
  return parser.parse(workbook, ctx);
}

export { PARSERS };
