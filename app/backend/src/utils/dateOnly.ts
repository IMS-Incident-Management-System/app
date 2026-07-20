/**
 * Нормализация календарной даты для полей DATE/timestamp без сдвига дня по TZ.
 * «2025-01-15» / ISO → Date в полдень UTC (безопасный календарный день).
 */
export function parseDateOnly(value: Date | string | null | undefined): Date | undefined {
  if (value == null || value === '') return undefined;
  const raw = typeof value === 'string' ? value : value.toISOString();
  const m = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) {
    return new Date(`${m[1]}T12:00:00.000Z`);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function requireDateOnly(value: Date | string | null | undefined): Date {
  const d = parseDateOnly(value);
  if (!d) {
    throw new Error('Некорректная дата');
  }
  return d;
}
