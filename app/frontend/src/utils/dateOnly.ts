import dayjs, { Dayjs } from "dayjs";

/** Календарный день для DatePicker/отображения без ложного сдвига. */
export function toDayjsDate(value: string | Date | Dayjs | null | undefined): Dayjs | undefined {
  if (value == null || value === "") return undefined;
  if (dayjs.isDayjs(value)) return value;
  const raw = String(value).trim();
  // Чистая дата YYYY-MM-DD — парсим как локальный календарный день
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return dayjs(raw);
  }
  // ISO/timestamp — локальный dayjs (для старых записей с UTC-смещением это корректнее)
  const d = dayjs(value);
  return d.isValid() ? d : undefined;
}

/** DatePicker → строка даты для API (без timezone-сдвига при сериализации). */
export function toDateOnlyString(
  value: string | Date | Dayjs | null | undefined,
  fallbackToday = false
): string | undefined {
  if (value == null || value === "") {
    return fallbackToday ? dayjs().format("YYYY-MM-DD") : undefined;
  }
  const d = dayjs.isDayjs(value) ? value : toDayjsDate(value);
  if (!d || !d.isValid()) {
    return fallbackToday ? dayjs().format("YYYY-MM-DD") : undefined;
  }
  return d.format("YYYY-MM-DD");
}
