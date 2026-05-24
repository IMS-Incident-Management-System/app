import { Role, UserRole } from '../models';

const ADMIN_ROLE_CODE = 'administrator';

/**
 * Если задана переменная FIRST_ADMIN_EXTERNAL_ID (Keycloak sub пользователя),
 * назначает этому пользователю роль «Администратор» при старте приложения.
 * Удобно для первого деплоя — после можно убрать переменную.
 */
export async function ensureFirstAdmin(): Promise<void> {
  const externalId = process.env.FIRST_ADMIN_EXTERNAL_ID?.trim();
  if (!externalId) {
    return;
  }
  console.log(`ensureFirstAdmin: FIRST_ADMIN_EXTERNAL_ID=${externalId}`);

  try {
    const adminRole = await Role.findOne({ where: { code: ADMIN_ROLE_CODE } });
    if (!adminRole) {
      console.warn('ensureFirstAdmin: роль "administrator" не найдена (миграция 038 применена?). Пропуск.');
      return;
    }

    const [_, created] = await UserRole.findOrCreate({
      where: { external_id: externalId, role_id: adminRole.id },
      defaults: { external_id: externalId, role_id: adminRole.id },
    });
    if (created) {
      console.log(`✅ Первый администратор назначен: external_id=${externalId}`);
    } else {
      console.log(`ensureFirstAdmin: пользователь external_id=${externalId} уже имеет роль administrator.`);
    }
  } catch (err) {
    console.error('ensureFirstAdmin error:', err);
    // Не падаем при старте — админа можно назначить через UI
  }
}
