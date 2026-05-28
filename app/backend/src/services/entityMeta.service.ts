import { authorService } from './author.service';
import { EntityMetaDto } from '../interfaces/activity';

type MetaEntity = {
  created_by?: string | null;
  updated_by?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export const entityMetaService = {
  applyCreateMeta<T extends Record<string, unknown>>(
    data: T,
    userSub: string | null | undefined
  ): T & { created_by?: string; updated_by?: string } {
    if (!userSub) return data;
    return {
      ...data,
      created_by: userSub,
      updated_by: userSub,
    };
  },

  applyUpdateMeta<T extends Record<string, unknown>>(
    data: T,
    userSub: string | null | undefined
  ): T & { updated_by?: string } {
    if (!userSub) return data;
    return {
      ...data,
      updated_by: userSub,
    };
  },

  async buildMetaDto(entity: MetaEntity | null | undefined): Promise<EntityMetaDto | null> {
    if (!entity) return null;

    const createdBy = entity.created_by ?? null;
    const updatedBy = entity.updated_by ?? null;
    const authors = await authorService.resolveAuthors(
      [createdBy, updatedBy].filter((id): id is string => Boolean(id))
    );

    return {
      created_by: createdBy,
      updated_by: updatedBy,
      created_at: entity.createdAt ? entity.createdAt.toISOString() : null,
      updated_at: entity.updatedAt ? entity.updatedAt.toISOString() : null,
      created_by_user: createdBy ? authors.get(createdBy) ?? null : null,
      updated_by_user: updatedBy ? authors.get(updatedBy) ?? null : null,
    };
  },
};
