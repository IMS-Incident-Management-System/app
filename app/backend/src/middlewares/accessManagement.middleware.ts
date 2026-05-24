import { Request, Response, NextFunction } from 'express';
import { getPermissionsForUser } from '../services/permission.service';
import { Permission } from '../enums/permissions';

/**
 * Разрешает доступ к управлению доступом только при наличии права access_management.manage.
 * Первого админа задаёт скрипт ensureFirstAdmin (переменная FIRST_ADMIN_EXTERNAL_ID).
 */
export async function allowAccessManagement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const sub = user?.sub;
    if (!sub) {
      res.status(401).json({ message: 'Пользователь не аутентифицирован' });
      return;
    }

    const userPerms = await getPermissionsForUser(sub);
    if (userPerms.includes(Permission.ACCESS_MANAGEMENT_MANAGE)) {
      next();
      return;
    }

    res.status(403).json({ message: 'Недостаточно прав для управления доступом' });
  } catch (error) {
    console.error('allowAccessManagement error:', error);
    res.status(500).json({ message: 'Ошибка проверки прав' });
  }
}
