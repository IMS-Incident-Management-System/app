import { ActivityTypes } from '../constants/activityTypes';
import { fieldToActivityType } from '../constants/activitySummary.builder';
import { OA_ALL_TRACKED_FIELDS } from '../constants/operationalActivityTrackedFields';
import { EntityType } from '../enums/entityActivity';
import { FieldChange } from '../interfaces/activity';

const INCIDENT_FINANCIAL_FIELDS = [
  'detected_damage',
  'recovered_damage',
  'prevented_damage',
  'additional_income',
  'reduced_cost',
] as const;

const EVENT_FINANCIAL_FIELDS = [
  ...INCIDENT_FINANCIAL_FIELDS,
  'prevented_unnecessary_writeoff',
  'vat_deducted',
] as const;

const EVENT_INVESTIGATION_FIELDS = [
  'is_service_investigation',
  'is_service_investigation_ib',
  'is_service_investigation_bpio',
  'is_service_investigation_bpio_hotline',
  'is_service_check',
  'is_service_check_ib',
  'is_service_check_bpio',
  'is_service_check_bpio_hotline',
  'is_verification_activity',
] as const;

const INCIDENT_ROOT_FIELDS = [
  'direction',
  'department_id',
  'description',
  'is_db',
  'is_sent_1db',
  ...INCIDENT_FINANCIAL_FIELDS,
  'object_type_ids',
] as const;

const EVENT_ROOT_FIELDS = [
  'department_id',
  'date',
  'description',
  'is_db',
  ...EVENT_FINANCIAL_FIELDS,
  ...EVENT_INVESTIGATION_FIELDS,
] as const;

function normalizeValue(field: string, value: unknown): unknown {
  if (value === undefined) return null;
  if (field === 'object_type_ids' && Array.isArray(value)) {
    return [...value].map(Number).sort((a, b) => a - b);
  }
  if (field === 'period_from' || field === 'period_to' || field === 'date') {
    if (value == null || value === '') return null;
    const d = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim() === '') return null;
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value);
    if (!Number.isNaN(n) && String(value).trim() !== '') return n;
  }
  return value;
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

function pushChange(
  changes: FieldChange[],
  field: string,
  oldVal: unknown,
  newVal: unknown,
  activityType = fieldToActivityType(field)
): void {
  const oldNorm = normalizeValue(field, oldVal);
  const newNorm = normalizeValue(field, newVal);
  if (isEqual(oldNorm, newNorm)) return;
  changes.push({ field, old: oldNorm, new: newNorm, activityType });
}

function collapseFinancialChanges(changes: FieldChange[], financialFields: readonly string[]): FieldChange[] {
  const financial = changes.filter((c) => financialFields.includes(c.field as typeof financialFields[number]));
  if (financial.length <= 1) return changes;
  const rest = changes.filter((c) => !financialFields.includes(c.field as typeof financialFields[number]));
  rest.push({
    field: 'financial_fields',
    old: Object.fromEntries(financial.map((f) => [f.field, f.old])),
    new: Object.fromEntries(financial.map((f) => [f.field, f.new])),
    activityType: ActivityTypes.FINANCIAL_FIELDS_CHANGED,
  });
  return rest;
}

function collapseInvestigationChanges(changes: FieldChange[]): FieldChange[] {
  const investigation = changes.filter((c) =>
    (EVENT_INVESTIGATION_FIELDS as readonly string[]).includes(c.field)
  );
  if (!investigation.length) return changes;
  const rest = changes.filter(
    (c) => !(EVENT_INVESTIGATION_FIELDS as readonly string[]).includes(c.field)
  );
  if (investigation.length === 1) {
    rest.push({
      ...investigation[0],
      activityType: ActivityTypes.INVESTIGATION_FLAGS_CHANGED,
    });
    return rest;
  }
  rest.push({
    field: 'investigation_flags',
    old: Object.fromEntries(investigation.map((f) => [f.field, f.old])),
    new: Object.fromEntries(investigation.map((f) => [f.field, f.new])),
    activityType: ActivityTypes.INVESTIGATION_FLAGS_CHANGED,
  });
  return rest;
}

export const semanticChangeService = {
  detectChanges(
    entityType: EntityType,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): FieldChange[] {
    let whitelist: readonly string[];
    let financialFields: readonly string[];

    switch (entityType) {
      case EntityType.INCIDENT:
        whitelist = INCIDENT_ROOT_FIELDS;
        financialFields = INCIDENT_FINANCIAL_FIELDS;
        break;
      case EntityType.EVENT:
        whitelist = EVENT_ROOT_FIELDS;
        financialFields = EVENT_FINANCIAL_FIELDS;
        break;
      case EntityType.OPERATIONAL_ACTIVITY:
        whitelist = OA_ALL_TRACKED_FIELDS;
        financialFields = [];
        break;
      default:
        return [];
    }

    const changes: FieldChange[] = [];

    if (entityType === EntityType.OPERATIONAL_ACTIVITY) {
      for (const field of whitelist) {
        pushChange(changes, field, before[field], after[field]);
      }
      if (!changes.length) return [];
      return [
        {
          field: 'details',
          old: null,
          new: null,
          activityType: ActivityTypes.FIELDS_BATCH_UPDATED,
        },
      ];
    }

    for (const field of whitelist) {
      if (!(field in before) && !(field in after)) continue;
      pushChange(changes, field, before[field], after[field]);
    }

    let result = collapseFinancialChanges(changes, financialFields);
    if (entityType === EntityType.EVENT) {
      result = collapseInvestigationChanges(result);
    }

    return result;
  },

  hasMainEventBlockChanged(
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null
  ): boolean {
    if (!before && !after) return false;
    if (!before || !after) return true;
    const keys = ['event_type_ids', 'sub_type_id', 'date', 'entry_date'] as const;
    return keys.some((key) => !isEqual(normalizeValue(key, before[key]), normalizeValue(key, after[key])));
  },

  snapshotMainEventBlock(event: {
    event_type_ids?: number[];
    sub_type_id?: number;
    date?: Date | string;
    entry_date?: Date | string;
  }): Record<string, unknown> {
    const ids = (event.event_type_ids ?? []).filter((id) => id != null).map(Number).sort((a, b) => a - b);
    return {
      event_type_ids: ids,
      sub_type_id: event.sub_type_id ?? null,
      date: event.date ?? null,
      entry_date: event.entry_date ?? null,
    };
  },
};
