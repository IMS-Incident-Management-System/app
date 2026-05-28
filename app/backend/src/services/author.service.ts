import UserProfile from '../models/userProfile';
import { ActivityActorDto } from '../interfaces/activity';

export const authorService = {
  async resolveAuthors(externalIds: string[]): Promise<Map<string, ActivityActorDto>> {
    const unique = [...new Set(externalIds.filter(Boolean))];
    const map = new Map<string, ActivityActorDto>();
    if (!unique.length) return map;

    const profiles = await UserProfile.findAll({
      where: { external_id: unique },
      attributes: ['external_id', 'display_name', 'preferred_username'],
    });

    for (const p of profiles) {
      map.set(p.external_id, {
        external_id: p.external_id,
        display_name: p.display_name,
        preferred_username: p.preferred_username,
      });
    }

    for (const id of unique) {
      if (!map.has(id)) {
        map.set(id, {
          external_id: id,
          display_name: null,
          preferred_username: null,
        });
      }
    }

    return map;
  },

  async resolveAuthor(externalId: string | null | undefined): Promise<ActivityActorDto | null> {
    if (!externalId) return null;
    const map = await this.resolveAuthors([externalId]);
    return map.get(externalId) ?? null;
  },
};
