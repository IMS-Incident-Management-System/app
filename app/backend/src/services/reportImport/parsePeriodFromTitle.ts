/**
 * Парсинг периода из заголовка Excel.
 *
 * Приоритет:
 * 1) «13.02.2024-25.06.2026» / «Результаты работы 13.02.2024 - 25.06.2026»
 * 2) «Результаты работы январь 2025» / «январь 2025 - февраль 2025» (legacy)
 */
const MONTHS: Record<string, number> = {
  январь: 0,
  января: 0,
  февраль: 1,
  февраля: 1,
  март: 2,
  марта: 2,
  апрель: 3,
  апреля: 3,
  май: 4,
  мая: 4,
  июнь: 5,
  июня: 5,
  июль: 6,
  июля: 6,
  август: 7,
  августа: 7,
  сентябрь: 8,
  сентября: 8,
  октябрь: 9,
  октября: 9,
  ноябрь: 10,
  ноября: 10,
  декабрь: 11,
  декабря: 11,
};

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function toDateOnly(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDotDate(dd: string, mm: string, yyyy: string): string | null {
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const maxDay = lastDayOfMonth(year, month - 1);
  if (day > maxDay) return null;
  return toDateOnly(year, month - 1, day);
}

export interface ParsedReportPeriod {
  periodFrom: string;
  periodTo: string;
  sourceTitle: string;
}

function parseDayRange(title: string): ParsedReportPeriod | null {
  const raw = String(title || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return null;

  // 13.02.2024-25.06.2026 or with spaces / en-dash / «Результаты работы»
  const re =
    /(?:результаты\s+работы\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–—]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i;
  const m = raw.match(re);
  if (!m) return null;

  const periodFrom = parseDotDate(m[1], m[2], m[3]);
  const periodTo = parseDotDate(m[4], m[5], m[6]);
  if (!periodFrom || !periodTo) return null;
  if (periodFrom > periodTo) return null;

  return {
    periodFrom,
    periodTo,
    sourceTitle: raw,
  };
}

function parseMonthRange(title: string): ParsedReportPeriod | null {
  const raw = String(title || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!raw) return null;

  const monthNames = Object.keys(MONTHS).join('|');
  const re = new RegExp(
    `(?:результаты\\s+работы\\s+)?(${monthNames})\\s+(\\d{4})(?:\\s*[-–—]\\s*(${monthNames})\\s+(\\d{4}))?`,
    'i'
  );
  const m = raw.match(re);
  if (!m) return null;

  const fromMonth = MONTHS[m[1].toLowerCase()];
  const fromYear = Number(m[2]);
  if (fromMonth == null || !Number.isFinite(fromYear)) return null;

  let toMonth = fromMonth;
  let toYear = fromYear;
  if (m[3] && m[4]) {
    toMonth = MONTHS[m[3].toLowerCase()];
    toYear = Number(m[4]);
    if (toMonth == null || !Number.isFinite(toYear)) return null;
  }

  return {
    periodFrom: toDateOnly(fromYear, fromMonth, 1),
    periodTo: toDateOnly(toYear, toMonth, lastDayOfMonth(toYear, toMonth)),
    sourceTitle: String(title).trim(),
  };
}

export function parsePeriodFromReportTitle(title: string): ParsedReportPeriod | null {
  return parseDayRange(title) ?? parseMonthRange(title);
}
