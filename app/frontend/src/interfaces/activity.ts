export interface ActivityActor {
  external_id: string;
  display_name: string | null;
  preferred_username: string | null;
}

export interface EntityMeta {
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_user: ActivityActor | null;
  updated_by_user: ActivityActor | null;
}

export type EntityActivityType =
  | 'created'
  | 'direction_changed'
  | 'department_changed'
  | 'description_changed'
  | 'is_db_changed'
  | 'financial_fields_changed'
  | 'object_types_changed'
  | 'period_changed'
  | 'date_changed'
  | 'investigation_flags_changed'
  | 'fields_batch_updated'
  | 'operational_metrics_changed'
  | 'incident_main_event_updated'
  | 'attachment_uploaded'
  | 'attachment_deleted';

export type ActivityCategory = 'lifecycle' | 'attachment' | 'relation';
export type ActivityImportance = 'low' | 'normal' | 'high';

export interface ActivityItem {
  id: number;
  activity_type: EntityActivityType;
  category: ActivityCategory;
  importance: ActivityImportance;
  summary: string;
  occurred_at: string;
  actor_type: string;
  source: string;
  actor: ActivityActor | null;
  metadata?: Record<string, unknown> | null;
}

export type EntityActivityResource = 'incidents' | 'events' | 'operational-activities';
