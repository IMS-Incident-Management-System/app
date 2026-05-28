export const ActivityTypes = {
  CREATED: 'created',
  DIRECTION_CHANGED: 'direction_changed',
  DEPARTMENT_CHANGED: 'department_changed',
  DESCRIPTION_CHANGED: 'description_changed',
  IS_DB_CHANGED: 'is_db_changed',
  FINANCIAL_FIELDS_CHANGED: 'financial_fields_changed',
  OBJECT_TYPES_CHANGED: 'object_types_changed',
  PERIOD_CHANGED: 'period_changed',
  DATE_CHANGED: 'date_changed',
  INVESTIGATION_FLAGS_CHANGED: 'investigation_flags_changed',
  FIELDS_BATCH_UPDATED: 'fields_batch_updated',
  OPERATIONAL_METRICS_CHANGED: 'operational_metrics_changed',
  INCIDENT_MAIN_EVENT_UPDATED: 'incident_main_event_updated',
  ATTACHMENT_UPLOADED: 'attachment_uploaded',
  ATTACHMENT_DELETED: 'attachment_deleted',
} as const;

export type ActivityType = (typeof ActivityTypes)[keyof typeof ActivityTypes];
