-- Роль по умолчанию «Администратор» со всеми правами (для первичной настройки)
-- После применения миграции назначьте эту роль пользователю вручную или через API управления доступом.

INSERT INTO roles (name, code, description)
VALUES (
  'Администратор',
  'administrator',
  'Полный доступ ко всем разделам и управлению ролями'
)
ON CONFLICT (code) DO NOTHING;

-- Все коды прав для роли Администратор
INSERT INTO role_permissions (role_id, permission)
SELECT r.id, v.permission
FROM roles r
CROSS JOIN (
  VALUES
    ('incident.list'::text), ('incident.create'), ('incident.read'), ('incident.update'), ('incident.delete'), ('incident.attachments'),
    ('additionally.read'), ('additionally.create'), ('additionally.update'), ('additionally.delete'),
    ('operational_activity.list'), ('operational_activity.create'), ('operational_activity.read'), ('operational_activity.update'), ('operational_activity.delete'),
    ('event.list'), ('event.create'), ('event.read'), ('event.update'), ('event.delete'),
    ('department.list'), ('department.create'), ('department.read'), ('department.update'), ('department.delete'),
    ('event_type.list'), ('event_type.create'), ('event_type.read'), ('event_type.update'), ('event_type.delete'),
    ('object_type.list'), ('object_type.create'), ('object_type.read'), ('object_type.update'), ('object_type.delete'),
    ('object.list'), ('object.create'), ('object.read'), ('object.update'), ('object.delete'),
    ('report.generate'), ('report.table'), ('report.export'), ('report.dashboard'),
    ('explanatory_note.list'), ('explanatory_note.create'), ('explanatory_note.read'), ('explanatory_note.update'), ('explanatory_note.delete'), ('explanatory_note.export'),
    ('profile.read'), ('profile.update'),
    ('access_management.manage')
) AS v(permission)
WHERE r.code = 'administrator'
ON CONFLICT (role_id, permission) DO NOTHING;
