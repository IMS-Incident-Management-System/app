import { ActivityType } from '../constants/activityTypes';
import {
  ActivityCategory,
  ActivityImportance,
  ActivitySource,
  ActorType,
  EntityType,
} from '../enums/entityActivity';

export interface ActivityActorContext {
  actorType: ActorType;
  actorExternalId: string | null;
  source: ActivitySource;
}

export interface RecordActivityInput {
  entityType: EntityType;
  entityId: number;
  activityType: ActivityType;
  category: ActivityCategory;
  importance?: ActivityImportance;
  summary: string;
  metadata?: Record<string, unknown> | null;
  actor: ActivityActorContext;
  occurredAt?: Date;
}

export interface FieldChange {
  field: string;
  old: unknown;
  new: unknown;
  activityType: ActivityType;
}

export interface ActivityActorDto {
  external_id: string;
  display_name: string | null;
  preferred_username: string | null;
}

export interface ActivityItemDto {
  id: number;
  activity_type: ActivityType;
  category: ActivityCategory;
  importance: ActivityImportance;
  summary: string;
  occurred_at: string;
  actor_type: ActorType;
  source: ActivitySource;
  actor: ActivityActorDto | null;
  metadata?: Record<string, unknown> | null;
}

export interface EntityMetaDto {
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_user: ActivityActorDto | null;
  updated_by_user: ActivityActorDto | null;
}
