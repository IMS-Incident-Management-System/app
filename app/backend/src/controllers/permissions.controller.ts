import { Request, Response } from 'express';
import { User } from '../interfaces/user';
import { PERMISSION_GROUPS } from '../enums/permissions';
import type { PermissionCode } from '../enums/permissions';
import { getPermissionsForUser } from '../services/permission.service';

interface RequestWithUser extends Request {
  user?: User & { sub?: string };
}

/** Преобразует список кодов прав в структуру по сущностям для фронта */
function buildPermissionsByEntity(codes: PermissionCode[]): Record<string, Record<string, boolean>> {
  const set = new Set(codes);
  const byEntity: Record<string, Record<string, boolean>> = {};

  for (const [entityKey, group] of Object.entries(PERMISSION_GROUPS)) {
    byEntity[entityKey] = {};
    for (const code of group.permissions) {
      const action = code.split('.')[1] || code;
      byEntity[entityKey][action] = set.has(code);
    }
  }
  return byEntity;
}

export async function getMyPermissions(req: RequestWithUser, res: Response) {
  try {
    const sub = req.user?.sub;
    if (!sub) {
      res.status(401).json({ message: 'Пользователь не аутентифицирован' });
      return;
    }

    const codes = await getPermissionsForUser(sub);
    const byEntity = buildPermissionsByEntity(codes);

    res.json({
      permissions: codes,
      byEntity,
    });
  } catch (error: any) {
    console.error('Ошибка при получении прав:', error);
    res.status(500).json({ message: 'Ошибка при получении прав', error: error.message });
  }
}
