import { Op, Transaction } from 'sequelize';
import EntityActivity, { EntityActivityInstance } from '../models/entityActivity';
import { RecordActivityInput, ActivityItemDto } from '../interfaces/activity';
import {
  ActivityImportance,
  ActivitySource,
  ActorType,
  EntityType,
} from '../enums/entityActivity';
import { authorService } from './author.service';

export interface ListActivityOptions {
  limit?: number;
  before?: string;
  categories?: string[];
}

export const activityService = {
  async record(
    params: RecordActivityInput,
    options?: { transaction?: Transaction }
  ): Promise<EntityActivityInstance> {
    return EntityActivity.create(
      {
        entity_type: params.entityType,
        entity_id: params.entityId,
        activity_type: params.activityType,
        category: params.category,
        importance: params.importance ?? ActivityImportance.NORMAL,
        actor_type: params.actor.actorType,
        actor_external_id: params.actor.actorExternalId,
        source: params.actor.source ?? ActivitySource.UI,
        occurred_at: params.occurredAt ?? new Date(),
        summary: params.summary,
        metadata: params.metadata ?? null,
      },
      { transaction: options?.transaction }
    );
  },

  async recordMany(
    items: RecordActivityInput[],
    options?: { transaction?: Transaction }
  ): Promise<void> {
    if (!items.length) return;
    await Promise.all(items.map((item) => this.record(item, options)));
  },

  async list(
    entityType: EntityType,
    entityId: number,
    options: ListActivityOptions = {}
  ): Promise<ActivityItemDto[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const where: Record<string, unknown> = {
      entity_type: entityType,
      entity_id: entityId,
    };

    if (options.before) {
      where.occurred_at = { [Op.lt]: new Date(options.before) };
    }

    if (options.categories?.length) {
      where.category = { [Op.in]: options.categories };
    }

    const rows = await EntityActivity.findAll({
      where,
      order: [['occurred_at', 'DESC']],
      limit,
    });

    const actorIds = rows
      .map((r) => r.actor_external_id)
      .filter((id): id is string => Boolean(id));
    const authors = await authorService.resolveAuthors(actorIds);

    return rows.map((row) => ({
      id: Number(row.id),
      activity_type: row.activity_type,
      category: row.category,
      importance: row.importance,
      summary: row.summary,
      occurred_at: row.occurred_at.toISOString(),
      actor_type: row.actor_type as ActorType,
      source: row.source,
      actor: row.actor_external_id
        ? authors.get(row.actor_external_id) ?? {
            external_id: row.actor_external_id,
            display_name: null,
            preferred_username: null,
          }
        : null,
      metadata: row.metadata,
    }));
  },
};
