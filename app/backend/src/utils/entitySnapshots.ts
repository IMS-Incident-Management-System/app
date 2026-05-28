import { Model } from 'sequelize';
import { IncidentInstance } from '../models/incident';
import { EventInstance } from '../models/event';
import {
  OperationalActivityAttributes,
  OperationalActivityInstance,
} from '../models/operationalActivity';
import { EntityType } from '../enums/entityActivity';
import { OA_ALL_TRACKED_FIELDS } from '../constants/operationalActivityTrackedFields';

function toPlainRecord(value: unknown): Record<string, unknown> {
  if (value instanceof Model) {
    return value.get({ plain: true }) as Record<string, unknown>;
  }
  return (value ?? {}) as Record<string, unknown>;
}

export function snapshotIncidentRoot(
  incident: IncidentInstance | Record<string, unknown>,
  objectTypeIds?: number[]
): Record<string, unknown> {
  const row = incident as Record<string, unknown>;
  return {
    direction: row.direction,
    department_id: row.department_id,
    description: row.description ?? null,
    is_db: Boolean(row.is_db),
    detected_damage: row.detected_damage != null ? Number(row.detected_damage) : null,
    recovered_damage: row.recovered_damage != null ? Number(row.recovered_damage) : null,
    prevented_damage: row.prevented_damage != null ? Number(row.prevented_damage) : null,
    additional_income: row.additional_income != null ? Number(row.additional_income) : null,
    reduced_cost: row.reduced_cost != null ? Number(row.reduced_cost) : null,
    object_type_ids: objectTypeIds ?? [],
  };
}

export function snapshotIncidentRootFromBody(body: Record<string, unknown>): Record<string, unknown> {
  const objectTypeIds =
    (body.object_type_ids as number[] | undefined) ??
    (body.object_type_id != null ? [Number(body.object_type_id)] : []);
  return {
    direction: body.direction,
    department_id: body.department_id,
    description: body.description ?? null,
    is_db: Boolean(body.is_db),
    detected_damage: body.detected_damage != null ? Number(body.detected_damage) : null,
    recovered_damage: body.recovered_damage != null ? Number(body.recovered_damage) : null,
    prevented_damage: body.prevented_damage != null ? Number(body.prevented_damage) : null,
    additional_income: body.additional_income != null ? Number(body.additional_income) : null,
    reduced_cost: body.reduced_cost != null ? Number(body.reduced_cost) : null,
    object_type_ids: Array.isArray(objectTypeIds) ? objectTypeIds.map(Number) : [],
  };
}

export function snapshotEventRoot(event: EventInstance | Record<string, unknown>): Record<string, unknown> {
  const row = event as Record<string, unknown>;
  return {
    department_id: row.department_id,
    date: row.date,
    description: row.description ?? null,
    is_db: Boolean(row.is_db),
    is_service_investigation: Boolean(row.is_service_investigation),
    is_service_investigation_ib: Boolean(row.is_service_investigation_ib),
    is_service_investigation_bpio: Boolean(row.is_service_investigation_bpio),
    is_service_investigation_bpio_hotline: Boolean(row.is_service_investigation_bpio_hotline),
    is_service_check: Boolean(row.is_service_check),
    is_service_check_ib: Boolean(row.is_service_check_ib),
    is_service_check_bpio: Boolean(row.is_service_check_bpio),
    is_service_check_bpio_hotline: Boolean(row.is_service_check_bpio_hotline),
    is_verification_activity: Boolean(row.is_verification_activity),
    detected_damage: row.detected_damage != null ? Number(row.detected_damage) : null,
    recovered_damage: row.recovered_damage != null ? Number(row.recovered_damage) : null,
    prevented_damage: row.prevented_damage != null ? Number(row.prevented_damage) : null,
    additional_income: row.additional_income != null ? Number(row.additional_income) : null,
    reduced_cost: row.reduced_cost != null ? Number(row.reduced_cost) : null,
    prevented_unnecessary_writeoff:
      row.prevented_unnecessary_writeoff != null ? Number(row.prevented_unnecessary_writeoff) : null,
    vat_deducted: row.vat_deducted != null ? Number(row.vat_deducted) : null,
  };
}

function snapshotOperationalActivityValue(value: unknown): unknown {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(trimmed)) return n;
  }
  return value;
}

export function snapshotOperationalActivityRoot(
  oa: OperationalActivityInstance | OperationalActivityAttributes | Record<string, unknown>
): Record<string, unknown> {
  const row =
    typeof (oa as OperationalActivityInstance).toJSON === 'function'
      ? (oa as OperationalActivityInstance).toJSON()
      : (oa as Record<string, unknown>);

  const result: Record<string, unknown> = {};
  for (const field of OA_ALL_TRACKED_FIELDS) {
    result[field] = snapshotOperationalActivityValue(row[field]);
  }
  return result;
}

export function entityTypeFromModel(
  model: 'incident' | 'event' | 'operational_activity'
): EntityType {
  switch (model) {
    case 'incident':
      return EntityType.INCIDENT;
    case 'event':
      return EntityType.EVENT;
    case 'operational_activity':
      return EntityType.OPERATIONAL_ACTIVITY;
  }
}
