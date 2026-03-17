-- Имя и логин в профиле для отображения в списке пользователей (управление доступом)

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(512),
  ADD COLUMN IF NOT EXISTS preferred_username VARCHAR(255);

COMMENT ON COLUMN user_profiles.display_name IS 'ФИО из Keycloak для отображения в списке пользователей';
COMMENT ON COLUMN user_profiles.preferred_username IS 'Логин из Keycloak';
