import { ActivityTypes, ActivityType } from './activityTypes';
import { EntityType } from '../enums/entityActivity';
import {
  fieldLabels,
  operationalDirectionLabels,
  securityDirectionLabels,
} from './directionLabels';

export interface SummaryContext {
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  fields?: Array<{ field: string; old?: unknown; new?: unknown }>;
  filename?: string;
  entityType?: EntityType;
}

const entityTypeTitles: Record<EntityType, string> = {
  [EntityType.INCIDENT]: 'инцидента',
  [EntityType.EVENT]: 'события',
  [EntityType.OPERATIONAL_ACTIVITY]: 'операционной деятельности',
};

function formatDirection(value: unknown, entityType?: EntityType): string {
  if (value == null || value === '') return '—';
  const labels =
    entityType === EntityType.OPERATIONAL_ACTIVITY
      ? operationalDirectionLabels
      : securityDirectionLabels;
  return labels[String(value)] ?? String(value);
}

function formatValue(field: string, value: unknown, entityType?: EntityType): string {
  if (value == null || value === '') return '—';
  if (field === 'direction') return formatDirection(value, entityType);
  if (field === 'is_db') return value ? 'да' : 'нет';
  if (field === 'object_type_ids') {
    const arr = Array.isArray(value) ? value : [];
    return arr.length ? `${arr.length} шт.` : '—';
  }
  if (typeof value === 'boolean') return value ? 'да' : 'нет';
  if (typeof value === 'number') return String(value);
  const s = String(value);
  return s.length > 80 ? `${s.slice(0, 77)}...` : s;
}

export function buildSummary(activityType: ActivityType, context: SummaryContext = {}): string {
  const { field, oldValue, newValue, fields, filename, entityType } = context;

  switch (activityType) {
    case ActivityTypes.CREATED:
      if (entityType) return `Создана карточка ${entityTypeTitles[entityType]}`;
      return 'Создана карточка';
    case ActivityTypes.DIRECTION_CHANGED:
      return `Направление изменено: ${formatDirection(oldValue, entityType)} → ${formatDirection(newValue, entityType)}`;
    case ActivityTypes.DEPARTMENT_CHANGED:
      return 'Изменено подразделение';
    case ActivityTypes.DESCRIPTION_CHANGED:
      return 'Изменено описание';
    case ActivityTypes.IS_DB_CHANGED:
      return `Изменён признак «Особо важно»: ${formatValue('is_db', oldValue)} → ${formatValue('is_db', newValue)}`;
    case ActivityTypes.FINANCIAL_FIELDS_CHANGED:
      return 'Изменены финансовые показатели';
    case ActivityTypes.OBJECT_TYPES_CHANGED:
      return `Изменены типы объектов: ${formatValue('object_type_ids', oldValue)} → ${formatValue('object_type_ids', newValue)}`;
    case ActivityTypes.PERIOD_CHANGED:
      return 'Изменён период операционной деятельности';
    case ActivityTypes.DATE_CHANGED:
      return 'Изменена дата события';
    case ActivityTypes.INVESTIGATION_FLAGS_CHANGED:
      return 'Изменены параметры расследований';
    case ActivityTypes.OPERATIONAL_METRICS_CHANGED:
      return 'Изменены показатели операционной деятельности';
    case ActivityTypes.INCIDENT_MAIN_EVENT_UPDATED:
      return 'Обновлены параметры основного события инцидента';
    case ActivityTypes.FIELDS_BATCH_UPDATED:
      return buildBatchSummary(entityType, fields);
    case ActivityTypes.ATTACHMENT_UPLOADED:
      return filename ? `Добавлено вложение: ${filename}` : 'Добавлено вложение';
    case ActivityTypes.ATTACHMENT_DELETED:
      return filename ? `Удалено вложение: ${filename}` : 'Удалено вложение';
    default:
      return field && fieldLabels[field]
        ? `Изменено поле «${fieldLabels[field]}»`
        : 'Изменение карточки';
  }
}

export function buildBatchSummary(
  entityType?: EntityType,
  fields?: Array<{ field: string }>
): string {
  if (entityType === EntityType.OPERATIONAL_ACTIVITY) {
    return 'Сведения изменены';
  }
  const title = entityType ? entityTypeTitles[entityType] : 'карточки';
  if (!fields?.length) return `Изменены основные параметры ${title}`;
  if (fields.length === 1 && fieldLabels[fields[0].field]) {
    return `Изменено поле «${fieldLabels[fields[0].field]}»`;
  }
  return `Изменены основные параметры ${title}`;
}

export function fieldToActivityType(field: string): ActivityType {
  switch (field) {
    case 'direction':
      return ActivityTypes.DIRECTION_CHANGED;
    case 'department_id':
      return ActivityTypes.DEPARTMENT_CHANGED;
    case 'description':
      return ActivityTypes.DESCRIPTION_CHANGED;
    case 'is_db':
      return ActivityTypes.IS_DB_CHANGED;
    case 'object_type_ids':
      return ActivityTypes.OBJECT_TYPES_CHANGED;
    case 'period':
      return ActivityTypes.PERIOD_CHANGED;
    case 'date':
      return ActivityTypes.DATE_CHANGED;
    case 'financial_fields':
      return ActivityTypes.FINANCIAL_FIELDS_CHANGED;
    case 'investigation_flags':
      return ActivityTypes.INVESTIGATION_FLAGS_CHANGED;
    default:
      return ActivityTypes.FIELDS_BATCH_UPDATED;
  }
}
