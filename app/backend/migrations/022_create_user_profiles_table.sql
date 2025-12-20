-- Миграция: создание таблицы профилей пользователей
-- Дата: 2025-12-19

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) NOT NULL UNIQUE,
  auth_provider VARCHAR(50),
  patronymic VARCHAR(255),
  personnel_number VARCHAR(255),
  photo_path VARCHAR(1024)
);

COMMENT ON TABLE user_profiles IS 'Профили пользователей, привязанные к внешнему идентификатору (Keycloak/MTS и т.п.)';
COMMENT ON COLUMN user_profiles.external_id IS 'Идентификатор пользователя во внешней системе (sub из токена)';
COMMENT ON COLUMN user_profiles.auth_provider IS 'Провайдер аутентификации (например, keycloak, mts)';
COMMENT ON COLUMN user_profiles.patronymic IS 'Отчество пользователя';
COMMENT ON COLUMN user_profiles.personnel_number IS 'Табельный номер пользователя';
COMMENT ON COLUMN user_profiles.photo_path IS 'Путь к файлу с фотографией пользователя';


