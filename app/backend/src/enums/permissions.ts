/**
 * Коды прав доступа. Бэкенд — источник правды: все проверки по этим кодам.
 * Keycloak используется только как identity provider (имя, логин, sub).
 */
export const Permission = {
  // Инциденты
  INCIDENT_LIST: 'incident.list',
  INCIDENT_CREATE: 'incident.create',
  INCIDENT_READ: 'incident.read',
  INCIDENT_UPDATE: 'incident.update',
  INCIDENT_DELETE: 'incident.delete',
  /** Вложения инцидента и вложения к событиям инцидента (incident-events) */
  INCIDENT_ATTACHMENTS: 'incident.attachments',

  // Дополнения к инцидентам
  ADDITIONALLY_READ: 'additionally.read',
  ADDITIONALLY_CREATE: 'additionally.create',
  ADDITIONALLY_UPDATE: 'additionally.update',
  ADDITIONALLY_DELETE: 'additionally.delete',

  // Оперативные мероприятия
  OPERATIONAL_ACTIVITY_LIST: 'operational_activity.list',
  OPERATIONAL_ACTIVITY_CREATE: 'operational_activity.create',
  OPERATIONAL_ACTIVITY_READ: 'operational_activity.read',
  OPERATIONAL_ACTIVITY_UPDATE: 'operational_activity.update',
  OPERATIONAL_ACTIVITY_DELETE: 'operational_activity.delete',

  // События
  EVENT_LIST: 'event.list',
  EVENT_CREATE: 'event.create',
  EVENT_READ: 'event.read',
  EVENT_UPDATE: 'event.update',
  EVENT_DELETE: 'event.delete',

  // Подразделения
  DEPARTMENT_LIST: 'department.list',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_READ: 'department.read',
  DEPARTMENT_UPDATE: 'department.update',
  DEPARTMENT_DELETE: 'department.delete',

  // Типы событий инцидентов
  EVENT_TYPE_LIST: 'event_type.list',
  EVENT_TYPE_CREATE: 'event_type.create',
  EVENT_TYPE_READ: 'event_type.read',
  EVENT_TYPE_UPDATE: 'event_type.update',
  EVENT_TYPE_DELETE: 'event_type.delete',

  // Типы объектов
  OBJECT_TYPE_LIST: 'object_type.list',
  OBJECT_TYPE_CREATE: 'object_type.create',
  OBJECT_TYPE_READ: 'object_type.read',
  OBJECT_TYPE_UPDATE: 'object_type.update',
  OBJECT_TYPE_DELETE: 'object_type.delete',

  // Объекты
  OBJECT_LIST: 'object.list',
  OBJECT_CREATE: 'object.create',
  OBJECT_READ: 'object.read',
  OBJECT_UPDATE: 'object.update',
  OBJECT_DELETE: 'object.delete',

  // Отчёты
  REPORT_GENERATE: 'report.generate',
  REPORT_TABLE: 'report.table',
  REPORT_EXPORT: 'report.export',
  REPORT_DASHBOARD: 'report.dashboard',

  // Пояснительные записки
  EXPLANATORY_NOTE_LIST: 'explanatory_note.list',
  EXPLANATORY_NOTE_CREATE: 'explanatory_note.create',
  EXPLANATORY_NOTE_READ: 'explanatory_note.read',
  EXPLANATORY_NOTE_UPDATE: 'explanatory_note.update',
  EXPLANATORY_NOTE_DELETE: 'explanatory_note.delete',
  EXPLANATORY_NOTE_EXPORT: 'explanatory_note.export',

  // Профиль (свои данные)
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',

  // Управление доступом (роли и назначения)
  ACCESS_MANAGEMENT_MANAGE: 'access_management.manage',
} as const;

export type PermissionCode = (typeof Permission)[keyof typeof Permission];

/** Все коды прав для валидации и сидирования */
export const ALL_PERMISSIONS: PermissionCode[] = Object.values(Permission);

/** Группы прав по сущностям для отображения в UI */
export const PERMISSION_GROUPS: Record<string, { label: string; permissions: PermissionCode[] }> = {
  incident: {
    label: 'Инциденты',
    permissions: [
      Permission.INCIDENT_LIST,
      Permission.INCIDENT_CREATE,
      Permission.INCIDENT_READ,
      Permission.INCIDENT_UPDATE,
      Permission.INCIDENT_DELETE,
      Permission.INCIDENT_ATTACHMENTS,
    ],
  },
  additionally: {
    label: 'Дополнения к инцидентам',
    permissions: [
      Permission.ADDITIONALLY_READ,
      Permission.ADDITIONALLY_CREATE,
      Permission.ADDITIONALLY_UPDATE,
      Permission.ADDITIONALLY_DELETE,
    ],
  },
  operational_activity: {
    label: 'Оперативные мероприятия',
    permissions: [
      Permission.OPERATIONAL_ACTIVITY_LIST,
      Permission.OPERATIONAL_ACTIVITY_CREATE,
      Permission.OPERATIONAL_ACTIVITY_READ,
      Permission.OPERATIONAL_ACTIVITY_UPDATE,
      Permission.OPERATIONAL_ACTIVITY_DELETE,
    ],
  },
  event: {
    label: 'События',
    permissions: [
      Permission.EVENT_LIST,
      Permission.EVENT_CREATE,
      Permission.EVENT_READ,
      Permission.EVENT_UPDATE,
      Permission.EVENT_DELETE,
    ],
  },
  department: {
    label: 'Подразделения',
    permissions: [
      Permission.DEPARTMENT_LIST,
      Permission.DEPARTMENT_CREATE,
      Permission.DEPARTMENT_READ,
      Permission.DEPARTMENT_UPDATE,
      Permission.DEPARTMENT_DELETE,
    ],
  },
  event_type: {
    label: 'Типы событий инцидентов',
    permissions: [
      Permission.EVENT_TYPE_LIST,
      Permission.EVENT_TYPE_CREATE,
      Permission.EVENT_TYPE_READ,
      Permission.EVENT_TYPE_UPDATE,
      Permission.EVENT_TYPE_DELETE,
    ],
  },
  object_type: {
    label: 'Типы объектов',
    permissions: [
      Permission.OBJECT_TYPE_LIST,
      Permission.OBJECT_TYPE_CREATE,
      Permission.OBJECT_TYPE_READ,
      Permission.OBJECT_TYPE_UPDATE,
      Permission.OBJECT_TYPE_DELETE,
    ],
  },
  object: {
    label: 'Объекты',
    permissions: [
      Permission.OBJECT_LIST,
      Permission.OBJECT_CREATE,
      Permission.OBJECT_READ,
      Permission.OBJECT_UPDATE,
      Permission.OBJECT_DELETE,
    ],
  },
  report: {
    label: 'Отчёты',
    permissions: [
      Permission.REPORT_GENERATE,
      Permission.REPORT_TABLE,
      Permission.REPORT_EXPORT,
      Permission.REPORT_DASHBOARD,
    ],
  },
  explanatory_note: {
    label: 'Пояснительные записки',
    permissions: [
      Permission.EXPLANATORY_NOTE_LIST,
      Permission.EXPLANATORY_NOTE_CREATE,
      Permission.EXPLANATORY_NOTE_READ,
      Permission.EXPLANATORY_NOTE_UPDATE,
      Permission.EXPLANATORY_NOTE_DELETE,
      Permission.EXPLANATORY_NOTE_EXPORT,
    ],
  },
  profile: {
    label: 'Профиль',
    permissions: [Permission.PROFILE_READ, Permission.PROFILE_UPDATE],
  },
  access_management: {
    label: 'Управление доступом',
    permissions: [Permission.ACCESS_MANAGEMENT_MANAGE],
  },
};
