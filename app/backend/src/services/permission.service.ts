import { UserRole, RolePermission } from '../models';
import type { PermissionCode } from '../enums/permissions';

/**
 * Возвращает список кодов прав для пользователя по external_id (Keycloak sub).
 * Бэкенд — источник правды: права берутся только из ролей в БД, не из Keycloak.
 */
export async function getPermissionsForUser(externalId: string): Promise<PermissionCode[]> {
  const userRoles = await UserRole.findAll({
    where: { external_id: externalId },
    attributes: ['role_id'],
  });

  if (userRoles.length === 0) {
    return [];
  }

  const roleIds = userRoles.map((ur) => ur.role_id);
  const rows = await RolePermission.findAll({
    where: { role_id: roleIds },
    attributes: ['permission'],
  });

  const set = new Set<string>();
  for (const row of rows) {
    set.add(row.permission);
  }
  return Array.from(set) as PermissionCode[];
}

/**
 * Проверяет, есть ли у пользователя хотя бы одно из переданных прав.
 */
export async function userHasAnyPermission(
  externalId: string,
  permissions: PermissionCode[]
): Promise<boolean> {
  const userPerms = await getPermissionsForUser(externalId);
  return permissions.some((p) => userPerms.includes(p));
}

/**
 * Проверяет, есть ли у пользователя указанное право.
 */
export async function userHasPermission(
  externalId: string,
  permission: PermissionCode
): Promise<boolean> {
  const userPerms = await getPermissionsForUser(externalId);
  return userPerms.includes(permission);
}
