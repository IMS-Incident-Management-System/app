import ExcelJS from 'exceljs';
import {
  getReportFieldsByNormalizedLabel,
  normalizeReportLabel,
} from '../../constants/reportFields';
import {
  cellAddress,
  cellToNumber,
  cellToString,
  ParseContext,
  ParseResult,
  ParsedReportFact,
  ReportImportParser,
} from './types';

const TOTAL_LABELS = new Set([
  normalizeReportLabel('Итого ГК МТС'),
  normalizeReportLabel('Итого ПАО МТС'),
  normalizeReportLabel('Показатель'),
]);

function getWorksheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet | undefined {
  return workbook.getWorksheet('Отчет') || workbook.worksheets[0];
}

function normalizeDeptTitle(title: string): string {
  return String(title || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Парсер формата текущей выгрузки IMS (лист «Отчет»).
 * Строки метрик сопоставляются по label → metricKey (порядок строк не важен;
 * при дубликатах labels — по порядку появления в файле).
 */
export const currentExportParser: ReportImportParser = {
  id: 'current_export_v1',

  canParse(workbook: ExcelJS.Workbook): boolean {
    const ws = getWorksheet(workbook);
    if (!ws) return false;
    const byLabel = getReportFieldsByNormalizedLabel();
    let knownLabels = 0;
    let hasIndicator = false;
    ws.eachRow({ includeEmpty: false }, (row) => {
      const a = normalizeReportLabel(cellToString(row.getCell(1).value));
      if (a === normalizeReportLabel('Показатель')) hasIndicator = true;
      if (byLabel.has(a)) knownLabels += 1;
    });
    return hasIndicator || knownLabels >= 3;
  },

  parse(workbook: ExcelJS.Workbook, ctx: ParseContext): ParseResult {
    const ws = getWorksheet(workbook);
    const warnings: string[] = [];
    const metricsUnrecognized: string[] = [];
    const departmentsUnrecognized: string[] = [];
    const facts: ParsedReportFact[] = [];

    if (!ws) {
      return {
        facts: [],
        validation: {
          parserId: this.id,
          metricsRecognized: 0,
          metricsUnrecognized: [],
          departmentsRecognized: 0,
          departmentsUnrecognized: [],
          factsCount: 0,
          warnings: ['Лист отчёта не найден'],
        },
      };
    }

    const byLabel = getReportFieldsByNormalizedLabel();
    const labelCursor = new Map<string, number>();

    let suggestedPeriodTitle: string | undefined;
    const titleCell = cellToString(ws.getRow(1).getCell(1).value).trim();
    if (titleCell) suggestedPeriodTitle = titleCell;

    // Find header row with «Показатель» and determine data start + leaf header row
    let indicatorRow = 0;
    let maxCol = 1;
    ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const a = normalizeReportLabel(cellToString(row.getCell(1).value));
      if (a === normalizeReportLabel('Показатель') && indicatorRow === 0) {
        indicatorRow = rowNumber;
      }
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber > maxCol) maxCol = colNumber;
      });
    });

    if (indicatorRow === 0) {
      // Fallback: first row that looks like a known metric label starts data; header is previous
      let firstData = 0;
      ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (firstData) return;
        const a = normalizeReportLabel(cellToString(row.getCell(1).value));
        if (byLabel.has(a)) firstData = rowNumber;
      });
      indicatorRow = Math.max(1, firstData - 1);
    }

    // Last header row = last row before first known metric (or indicatorRow + spans)
    let dataStartRow = indicatorRow + 1;
    for (let r = indicatorRow; r <= indicatorRow + 8; r++) {
      const a = normalizeReportLabel(cellToString(ws.getRow(r).getCell(1).value));
      if (byLabel.has(a)) {
        dataStartRow = r;
        break;
      }
      // blank A under merged «Показатель» — keep scanning
      if (r > indicatorRow && a && a !== normalizeReportLabel('Показатель') && !byLabel.has(a)) {
        // still header area possibly
      }
    }
    // Find actual first data row with known label
    for (let r = indicatorRow; r <= Math.min(indicatorRow + 12, ws.rowCount || indicatorRow + 12); r++) {
      const a = normalizeReportLabel(cellToString(ws.getRow(r).getCell(1).value));
      if (byLabel.has(a)) {
        dataStartRow = r;
        break;
      }
    }

    const leafHeaderRow = Math.max(indicatorRow, dataStartRow - 1);

    // Map columns → departmentId (skip totals)
    type ColMap = { col: number; departmentId: number | null; title: string; skip: boolean };
    const colMaps: ColMap[] = [];
    const recognizedDeptTitles = new Set<string>();

    for (let col = 2; col <= maxCol; col++) {
      const title = cellToString(ws.getRow(leafHeaderRow).getCell(col).value).trim();
      // Merged cells: value may be only on master — walk up header rows
      let resolvedTitle = title;
      if (!resolvedTitle) {
        for (let hr = leafHeaderRow - 1; hr >= indicatorRow; hr--) {
          const t = cellToString(ws.getRow(hr).getCell(col).value).trim();
          if (t) {
            resolvedTitle = t;
            break;
          }
        }
      }
      const norm = normalizeReportLabel(resolvedTitle);
      if (!resolvedTitle) continue;
      if (TOTAL_LABELS.has(norm) || norm.startsWith('итого')) {
        colMaps.push({ col, departmentId: null, title: resolvedTitle, skip: true });
        continue;
      }
      const ids = ctx.leafDepartmentsByTitle.get(normalizeDeptTitle(resolvedTitle)) ?? [];
      if (ids.length === 1) {
        colMaps.push({ col, departmentId: ids[0], title: resolvedTitle, skip: false });
        recognizedDeptTitles.add(resolvedTitle);
      } else if (ids.length === 0) {
        departmentsUnrecognized.push(resolvedTitle);
        colMaps.push({ col, departmentId: null, title: resolvedTitle, skip: true });
      } else {
        warnings.push(`Департамент «${resolvedTitle}» неоднозначен (${ids.length} листьев)`);
        departmentsUnrecognized.push(resolvedTitle);
        colMaps.push({ col, departmentId: null, title: resolvedTitle, skip: true });
      }
    }

    const metricsSeen = new Set<string>();
    const endRow = ws.rowCount || dataStartRow + 200;

    for (let r = dataStartRow; r <= endRow; r++) {
      const labelRaw = cellToString(ws.getRow(r).getCell(1).value).trim();
      if (!labelRaw) continue;
      const norm = normalizeReportLabel(labelRaw);
      if (TOTAL_LABELS.has(norm)) continue;

      const candidates = byLabel.get(norm);
      if (!candidates || candidates.length === 0) {
        metricsUnrecognized.push(labelRaw);
        continue;
      }
      const cursor = labelCursor.get(norm) ?? 0;
      const def = candidates[Math.min(cursor, candidates.length - 1)];
      labelCursor.set(norm, cursor + 1);
      metricsSeen.add(def.metricKey);

      for (const cm of colMaps) {
        if (cm.skip || cm.departmentId == null) continue;
        const cell = ws.getRow(r).getCell(cm.col);
        const num = cellToNumber(cell.value);
        const value = num == null ? 0 : num;
        facts.push({
          metricKey: def.metricKey,
          departmentId: cm.departmentId,
          value,
          excelAddress: cellAddress(r, cm.col),
        });
      }
    }

    return {
      facts,
      suggestedPeriodTitle,
      validation: {
        parserId: this.id,
        metricsRecognized: metricsSeen.size,
        metricsUnrecognized: [...new Set(metricsUnrecognized)],
        departmentsRecognized: recognizedDeptTitles.size,
        departmentsUnrecognized: [...new Set(departmentsUnrecognized)],
        factsCount: facts.length,
        warnings,
      },
    };
  },
};
