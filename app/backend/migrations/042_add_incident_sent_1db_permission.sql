-- Право «Отправлено 1ДБ» для роли Администратор
-- Дата: 2026-03-18

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'incident.sent_1db'
FROM roles r
WHERE r.code = 'administrator'
ON CONFLICT (role_id, permission) DO NOTHING;
