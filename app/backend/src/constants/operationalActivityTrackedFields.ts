import OperationalActivity from '../models/operationalActivity';

const SYSTEM_FIELDS = new Set([
  'id',
  'code',
  'created_by',
  'updated_by',
  'createdAt',
  'updatedAt',
]);

/** Поля «шапки» карточки — отдельные semantic activity */
export const OA_HEADER_FIELDS = [
  'direction',
  'department_id',
  'description',
  'period_from',
  'period_to',
  'entry_date',
] as const;

const headerSet = new Set<string>(OA_HEADER_FIELDS);

/** Count-поля, тексты секций и прочие показатели по направлениям */
export const OA_METRIC_FIELDS = Object.keys(OperationalActivity.getAttributes()).filter(
  (key) => !SYSTEM_FIELDS.has(key) && !headerSet.has(key)
);

export const OA_ALL_TRACKED_FIELDS = [...OA_HEADER_FIELDS, ...OA_METRIC_FIELDS] as const;
