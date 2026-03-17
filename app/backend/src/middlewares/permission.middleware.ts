import { Request, Response, NextFunction } from 'express';
import { userHasAnyPermission } from '../services/permission.service';
import type { PermissionCode } from '../enums/permissions';

/**
 * Требует аутентификации (verifyToken уже должен быть применён) и наличие хотя бы одного из указанных прав.
 * Возвращает 403, если прав нет.
 */
export function requirePermission(permissions: PermissionCode[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sub = (req as any).user?.sub;
      if (!sub) {
        res.status(401).json({ message: 'Пользователь не аутентифицирован' });
        return;
      }

      const hasPermission = await userHasAnyPermission(sub, permissions);
      if (!hasPermission) {
        res.status(403).json({
          message: 'Недостаточно прав для выполнения действия',
          requiredPermissions: permissions,
        });
        return;
      }
      next();
      return;
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Ошибка проверки прав' });
      return;
    }
  };
}

/**
 * Требует одно конкретное право.
 */
export function requireOnePermission(permission: PermissionCode) {
  return requirePermission([permission]);
}
