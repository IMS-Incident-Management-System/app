import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { UserProfile, Role, RolePermission, UserRole } from '../models';
import { ALL_PERMISSIONS, PERMISSION_GROUPS, type PermissionCode } from '../enums/permissions';

export async function listRoles(_req: Request, res: Response) {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']],
      include: [{ model: RolePermission, as: 'permissions', attributes: ['permission'] }],
    });
    res.json(
      roles.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        permissions: (r as any).permissions?.map((p: { permission: string }) => p.permission) || [],
      }))
    );
  } catch (error: any) {
    console.error('listRoles error:', error);
    res.status(500).json({ message: 'Ошибка при получении ролей', error: error.message });
  }
}

export async function getRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const role = await Role.findByPk(id, {
      include: [{ model: RolePermission, as: 'permissions', attributes: ['permission'] }],
    });
    if (!role) {
      res.status(404).json({ message: 'Роль не найдена' });
      return;
    }
    const perms = (role as any).permissions?.map((p: { permission: string }) => p.permission) || [];
    res.json({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: perms,
    });
  } catch (error: any) {
    console.error('getRole error:', error);
    res.status(500).json({ message: 'Ошибка при получении роли', error: error.message });
  }
}

export async function createRole(req: Request, res: Response) {
  try {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) {
      res.status(400).json({ message: 'Укажите name и code роли' });
      return;
    }
    const permList: string[] = Array.isArray(permissions) ? permissions : [];
    const validPerms = permList.filter((p) => ALL_PERMISSIONS.includes(p as PermissionCode));

    const role = await Role.create({ name, code, description: description || null });
    if (validPerms.length > 0) {
      await RolePermission.bulkCreate(
        validPerms.map((permission) => ({ role_id: role.id, permission }))
      );
    }
    const perms = await RolePermission.findAll({ where: { role_id: role.id }, attributes: ['permission'] });
    res.status(201).json({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: perms.map((p) => p.permission),
    });
  } catch (error: any) {
    console.error('createRole error:', error);
    res.status(500).json({ message: 'Ошибка при создании роли', error: error.message });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ message: 'Роль не найдена' });
      return;
    }
    const { name, code, description, permissions } = req.body;
    if (name != null) role.name = name;
    if (code != null) role.code = code;
    if (description !== undefined) role.description = description;
    await role.save();

    if (Array.isArray(permissions)) {
      await RolePermission.destroy({ where: { role_id: id } });
      const validPerms = permissions.filter((p) => ALL_PERMISSIONS.includes(p as PermissionCode));
      if (validPerms.length > 0) {
        await RolePermission.bulkCreate(
          validPerms.map((permission) => ({ role_id: id, permission }))
        );
      }
    }

    const perms = await RolePermission.findAll({ where: { role_id: id }, attributes: ['permission'] });
    res.json({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: perms.map((p) => p.permission),
    });
  } catch (error: any) {
    console.error('updateRole error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении роли', error: error.message });
  }
}

export async function deleteRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ message: 'Роль не найдена' });
      return;
    }
    await role.destroy();
    res.status(204).send();
  } catch (error: any) {
    console.error('deleteRole error:', error);
    res.status(500).json({ message: 'Ошибка при удалении роли', error: error.message });
  }
}

/** Список пользователей (профили) с назначенными ролями. Поиск: query.search. Пагинация: query.page, query.limit */
export async function listUsers(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [Op.or]: [
            { display_name: { [Op.iLike]: `%${search}%` } },
            { preferred_username: { [Op.iLike]: `%${search}%` } },
            { external_id: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : undefined;

    const { rows: profiles, count: total } = await UserProfile.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      attributes: ['id', 'external_id', 'display_name', 'preferred_username'],
      limit,
      offset,
    });

    const externalIds = profiles.map((p) => p.external_id);
    const userRoles = await UserRole.findAll({
      where: externalIds.length ? { external_id: { [Op.in]: externalIds } } : undefined,
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'code'] }],
    });
    const byUser = new Map<string, { id: number; name: string; code: string }[]>();
    for (const ur of userRoles) {
      const list = byUser.get(ur.external_id) || [];
      const role = (ur as any).role;
      list.push(role ? { id: role.id, name: role.name, code: role.code } : { id: ur.role_id, name: '', code: '' });
      byUser.set(ur.external_id, list);
    }

    const data = profiles.map((p) => ({
      id: p.id,
      external_id: p.external_id,
      display_name: p.display_name || p.preferred_username || p.external_id,
      preferred_username: p.preferred_username,
      roles: byUser.get(p.external_id) || [],
    }));

    res.json({ data, total });
  } catch (error: any) {
    console.error('listUsers error:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
  }
}

/** Назначить роли пользователю (полная замена списка ролей) */
export async function setUserRoles(req: Request, res: Response) {
  try {
    const { external_id } = req.params;
    const { role_ids } = req.body;
    if (!external_id) {
      res.status(400).json({ message: 'Укажите external_id пользователя' });
      return;
    }
    const roleIds = Array.isArray(role_ids) ? role_ids.map(Number).filter(Boolean) : [];
    await UserRole.destroy({ where: { external_id } });
    if (roleIds.length > 0) {
      await UserRole.bulkCreate(roleIds.map((role_id: number) => ({ external_id, role_id })));
    }
    const assigned = await UserRole.findAll({
      where: { external_id },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'code'] }],
    });
    res.json({
      external_id,
      roles: assigned.map((ur) => {
        const role = (ur as any).role;
        return role ? { id: role.id, name: role.name, code: role.code } : { id: ur.role_id, name: '', code: '' };
      }),
    });
  } catch (error: any) {
    console.error('setUserRoles error:', error);
    res.status(500).json({ message: 'Ошибка при назначении ролей', error: error.message });
  }
}

/** Получить список всех кодов прав (для UI при создании/редактировании роли) */
export async function listPermissionCodes(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.json({ permissions: ALL_PERMISSIONS, groups: PERMISSION_GROUPS });
}
