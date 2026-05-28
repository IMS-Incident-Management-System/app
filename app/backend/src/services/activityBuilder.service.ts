import { Transaction } from 'sequelize';
import { ActivityTypes } from '../constants/activityTypes';
import { buildSummary } from '../constants/activitySummary.builder';
import {
  ActivityCategory,
  ActivityImportance,
  EntityType,
} from '../enums/entityActivity';
import {
  ActivityActorContext,
  FieldChange,
  RecordActivityInput,
} from '../interfaces/activity';
import { activityService } from './activity.service';
import { semanticChangeService } from './semanticChange.service';

const BATCH_THRESHOLD = 2;

function defaultImportance(activityType: string): ActivityImportance {
  if (activityType === ActivityTypes.CREATED) return ActivityImportance.HIGH;
  return ActivityImportance.NORMAL;
}

function defaultCategory(activityType: string): ActivityCategory {
  if (
    activityType === ActivityTypes.ATTACHMENT_UPLOADED ||
    activityType === ActivityTypes.ATTACHMENT_DELETED
  ) {
    return ActivityCategory.ATTACHMENT;
  }
  if (activityType === ActivityTypes.INCIDENT_MAIN_EVENT_UPDATED) {
    return ActivityCategory.RELATION;
  }
  return ActivityCategory.LIFECYCLE;
}

function buildInputsFromChanges(
  entityType: EntityType,
  entityId: number,
  changes: FieldChange[],
  actor: ActivityActorContext
): RecordActivityInput[] {
  if (!changes.length) return [];

  if (changes.length >= BATCH_THRESHOLD) {
    const activityType = ActivityTypes.FIELDS_BATCH_UPDATED;
    return [
      {
        entityType,
        entityId,
        activityType,
        category: ActivityCategory.LIFECYCLE,
        importance: ActivityImportance.NORMAL,
        summary: buildSummary(activityType, {
          entityType,
          fields: changes.map((c) => ({ field: c.field })),
        }),
        metadata: {
          fields: changes.map((c) => ({
            field: c.field,
            old: c.old,
            new: c.new,
            activity_type: c.activityType,
          })),
        },
        actor,
      },
    ];
  }

  return changes.map((change) => ({
    entityType,
    entityId,
    activityType: change.activityType,
    category: defaultCategory(change.activityType),
    importance: defaultImportance(change.activityType),
    summary: buildSummary(change.activityType, {
      field: change.field,
      oldValue: change.old,
      newValue: change.new,
      entityType,
    }),
    metadata: { field: change.field, old: change.old, new: change.new },
    actor,
  }));
}

export const activityBuilderService = {
  buildActivitiesFromChanges(
    entityType: EntityType,
    entityId: number,
    changes: FieldChange[],
    actor: ActivityActorContext
  ): RecordActivityInput[] {
    return buildInputsFromChanges(entityType, entityId, changes, actor);
  },

  buildCreatedActivity(
    entityType: EntityType,
    entityId: number,
    actor: ActivityActorContext
  ): RecordActivityInput {
    const activityType = ActivityTypes.CREATED;
    return {
      entityType,
      entityId,
      activityType,
      category: ActivityCategory.LIFECYCLE,
      importance: ActivityImportance.HIGH,
      summary: buildSummary(activityType, { entityType }),
      actor,
    };
  },

  buildMainEventUpdatedActivity(
    entityId: number,
    actor: ActivityActorContext,
    metadata?: Record<string, unknown>
  ): RecordActivityInput {
    const activityType = ActivityTypes.INCIDENT_MAIN_EVENT_UPDATED;
    return {
      entityType: EntityType.INCIDENT,
      entityId,
      activityType,
      category: ActivityCategory.RELATION,
      importance: ActivityImportance.NORMAL,
      summary: buildSummary(activityType),
      metadata: metadata ?? null,
      actor,
    };
  },

  buildAttachmentUploaded(
    entityType: EntityType,
    entityId: number,
    filename: string,
    actor: ActivityActorContext,
    metadata?: Record<string, unknown>
  ): RecordActivityInput {
    const activityType = ActivityTypes.ATTACHMENT_UPLOADED;
    return {
      entityType,
      entityId,
      activityType,
      category: ActivityCategory.ATTACHMENT,
      importance: ActivityImportance.NORMAL,
      summary: buildSummary(activityType, { filename }),
      metadata: { filename, ...metadata },
      actor,
    };
  },

  buildAttachmentDeleted(
    entityType: EntityType,
    entityId: number,
    filename: string,
    actor: ActivityActorContext,
    metadata?: Record<string, unknown>
  ): RecordActivityInput {
    const activityType = ActivityTypes.ATTACHMENT_DELETED;
    return {
      entityType,
      entityId,
      activityType,
      category: ActivityCategory.ATTACHMENT,
      importance: ActivityImportance.NORMAL,
      summary: buildSummary(activityType, { filename }),
      metadata: { filename, ...metadata },
      actor,
    };
  },

  async recordFromChanges(
    entityType: EntityType,
    entityId: number,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    actor: ActivityActorContext,
    options?: { transaction?: Transaction }
  ): Promise<void> {
    const changes = semanticChangeService.detectChanges(entityType, before, after);
    const inputs = this.buildActivitiesFromChanges(entityType, entityId, changes, actor);
    await activityService.recordMany(inputs, options);
  },

  async recordCreated(
    entityType: EntityType,
    entityId: number,
    actor: ActivityActorContext,
    options?: { transaction?: Transaction }
  ): Promise<void> {
    await activityService.record(this.buildCreatedActivity(entityType, entityId, actor), options);
  },
};
