import type { RootState } from "../../store";

export const selectPermissions = (state: RootState) => state.permissions;
export const selectByEntity = (state: RootState) => state.permissions.byEntity;
export const selectPermissionCodes = (state: RootState) => state.permissions.permissions;

export const selectCan = (entity: string, action: string) => (state: RootState) =>
  Boolean(state.permissions.byEntity[entity]?.[action]);

// Инциденты
export const selectCanCreateIncident = (state: RootState) =>
  Boolean(state.permissions.byEntity.incident?.create);
export const selectCanUpdateIncident = (state: RootState) =>
  Boolean(state.permissions.byEntity.incident?.update);
export const selectCanDeleteIncident = (state: RootState) =>
  Boolean(state.permissions.byEntity.incident?.delete);
export const selectCanIncidentAttachments = (state: RootState) =>
  Boolean(state.permissions.byEntity.incident?.attachments);

// Дополнения к инцидентам
export const selectCanReadAdditionally = (state: RootState) =>
  Boolean(state.permissions.byEntity.additionally?.read);
export const selectCanCreateAdditionally = (state: RootState) =>
  Boolean(state.permissions.byEntity.additionally?.create);
export const selectCanUpdateAdditionally = (state: RootState) =>
  Boolean(state.permissions.byEntity.additionally?.update);
export const selectCanDeleteAdditionally = (state: RootState) =>
  Boolean(state.permissions.byEntity.additionally?.delete);

// Оперативные мероприятия
export const selectCanCreateOperationalActivity = (state: RootState) =>
  Boolean(state.permissions.byEntity.operational_activity?.create);
export const selectCanUpdateOperationalActivity = (state: RootState) =>
  Boolean(state.permissions.byEntity.operational_activity?.update);
export const selectCanDeleteOperationalActivity = (state: RootState) =>
  Boolean(state.permissions.byEntity.operational_activity?.delete);

// События
export const selectCanCreateEvent = (state: RootState) =>
  Boolean(state.permissions.byEntity.event?.create);
export const selectCanUpdateEvent = (state: RootState) =>
  Boolean(state.permissions.byEntity.event?.update);
export const selectCanDeleteEvent = (state: RootState) =>
  Boolean(state.permissions.byEntity.event?.delete);

// Подразделения
export const selectCanCreateDepartment = (state: RootState) =>
  Boolean(state.permissions.byEntity.department?.create);
export const selectCanUpdateDepartment = (state: RootState) =>
  Boolean(state.permissions.byEntity.department?.update);
export const selectCanDeleteDepartment = (state: RootState) =>
  Boolean(state.permissions.byEntity.department?.delete);

// Типы событий инцидентов
export const selectCanCreateEventType = (state: RootState) =>
  Boolean(state.permissions.byEntity.event_type?.create);
export const selectCanUpdateEventType = (state: RootState) =>
  Boolean(state.permissions.byEntity.event_type?.update);
export const selectCanDeleteEventType = (state: RootState) =>
  Boolean(state.permissions.byEntity.event_type?.delete);

// Типы объектов
export const selectCanCreateObjectType = (state: RootState) =>
  Boolean(state.permissions.byEntity.object_type?.create);
export const selectCanUpdateObjectType = (state: RootState) =>
  Boolean(state.permissions.byEntity.object_type?.update);
export const selectCanDeleteObjectType = (state: RootState) =>
  Boolean(state.permissions.byEntity.object_type?.delete);

// Объекты (дерево)
export const selectCanCreateObject = (state: RootState) =>
  Boolean(state.permissions.byEntity.object?.create);
export const selectCanUpdateObject = (state: RootState) =>
  Boolean(state.permissions.byEntity.object?.update);
export const selectCanDeleteObject = (state: RootState) =>
  Boolean(state.permissions.byEntity.object?.delete);

// Отчёты
export const selectCanReportGenerate = (state: RootState) =>
  Boolean(state.permissions.byEntity.report?.generate);
export const selectCanReportTable = (state: RootState) =>
  Boolean(state.permissions.byEntity.report?.table);
export const selectCanReportExport = (state: RootState) =>
  Boolean(state.permissions.byEntity.report?.export);
export const selectCanReportDashboard = (state: RootState) =>
  Boolean(state.permissions.byEntity.report?.dashboard);

// Пояснительные записки
export const selectCanCreateExplanatoryNote = (state: RootState) =>
  Boolean(state.permissions.byEntity.explanatory_note?.create);
export const selectCanUpdateExplanatoryNote = (state: RootState) =>
  Boolean(state.permissions.byEntity.explanatory_note?.update);
export const selectCanDeleteExplanatoryNote = (state: RootState) =>
  Boolean(state.permissions.byEntity.explanatory_note?.delete);
export const selectCanExplanatoryNoteExport = (state: RootState) =>
  Boolean(state.permissions.byEntity.explanatory_note?.export);

// Профиль
export const selectCanUpdateProfile = (state: RootState) =>
  Boolean(state.permissions.byEntity.profile?.update);

// Управление доступом
export const selectCanManageAccess = (state: RootState) =>
  Boolean(state.permissions.byEntity.access_management?.manage);
