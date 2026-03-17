-- Роли и права доступа (бэкенд — источник правды, Keycloak только identity)
-- Роли создаются в приложении; для каждой роли задаётся набор прав; роли назначаются пользователям по external_id (Keycloak sub).

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  PRIMARY KEY (role_id, permission)
);

CREATE TABLE IF NOT EXISTS user_roles (
  external_id VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (external_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_external_id ON user_roles(external_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);

COMMENT ON TABLE roles IS 'Роли приложения; права задаются через role_permissions';
COMMENT ON TABLE role_permissions IS 'Набор прав для каждой роли';
COMMENT ON TABLE user_roles IS 'Назначение ролей пользователям по external_id (Keycloak sub)';
