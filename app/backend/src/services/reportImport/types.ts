import ExcelJS from 'exceljs';

export interface ParsedReportFact {
  metricKey: string;
  departmentId: number;
  value: number;
  excelAddress: string;
}

export interface ParseValidationSummary {
  parserId: string;
  metricsRecognized: number;
  metricsUnrecognized: string[];
  departmentsRecognized: number;
  departmentsUnrecognized: string[];
  factsCount: number;
  warnings: string[];
}

export interface ParseResult {
  facts: ParsedReportFact[];
  validation: ParseValidationSummary;
  suggestedPeriodTitle?: string;
}

export interface ParseContext {
  /** title (normalized) → list of leaf department ids (ambiguity if >1) */
  leafDepartmentsByTitle: Map<string, number[]>;
}

export interface ReportImportParser {
  id: string;
  canParse(workbook: ExcelJS.Workbook): boolean;
  parse(workbook: ExcelJS.Workbook, ctx: ParseContext): ParseResult;
}

export function colToLetter(col: number): string {
  let n = col;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function cellAddress(row: number, col: number): string {
  return `${colToLetter(col)}${row}`;
}

export function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const v = value as { text?: string; result?: unknown; richText?: Array<{ text: string }> };
    if (typeof v.result === 'string' || typeof v.result === 'number') return String(v.result);
    if (typeof v.text === 'string') return v.text;
    if (Array.isArray(v.richText)) return v.richText.map((r) => r.text).join('');
  }
  return String(value);
}

export function cellToNumber(value: ExcelJS.CellValue): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'object' && value !== null && 'result' in value) {
    const r = (value as { result?: unknown }).result;
    if (typeof r === 'number' && !Number.isNaN(r)) return r;
    if (typeof r === 'string') {
      const n = Number(String(r).replace(/\s/g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    }
  }
  const raw = cellToString(value).replace(/\s/g, '').replace(',', '.');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
