import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { incidentEventTypeController } from '../controllers/incidentEventType.controller';
import { objectTypeController } from '../controllers/objectType.controller';
import { objectsController } from '../controllers/object.controller';
import { getIncidents } from '../controllers/incident/getIncidents.controller';
import { createIncident } from '../controllers/incident/createIncident.controller';
import { getIncident } from '../controllers/incident/getIncident.controller';
import { updateIncident } from '../controllers/incident/updateIncident.controller';
import { deleteIncident } from '../controllers/incident/deleteIncident.controller';
import { getIncidentAttachments } from '../controllers/incident/getIncidentAttachments.controller';
import { uploadIncidentAttachments } from '../controllers/incident/uploadIncidentAttachments.controller';
import { downloadIncidentAttachment } from '../controllers/incident/downloadIncidentAttachment.controller';
import { deleteIncidentAttachment } from '../controllers/incident/deleteIncidentAttachment.controller';
import { getIncidentEventAttachments } from '../controllers/incidentEvent/getIncidentEventAttachments.controller';
import { uploadIncidentEventAttachments } from '../controllers/incidentEvent/uploadIncidentEventAttachments.controller';
import { downloadIncidentEventAttachment } from '../controllers/incidentEvent/downloadIncidentEventAttachment.controller';
import { deleteIncidentEventAttachment } from '../controllers/incidentEvent/deleteIncidentEventAttachment.controller';
import { getOperationalActivities } from '../controllers/operationalActivity/getOperationalActivities.controller';
import { createOperationalActivity } from '../controllers/operationalActivity/createOperationalActivity.controller';
import { getOperationalActivity } from '../controllers/operationalActivity/getOperationalActivity.controller';
import { updateOperationalActivity } from '../controllers/operationalActivity/updateOperationalActivity.controller';
import { deleteOperationalActivity } from '../controllers/operationalActivity/deleteOperationalActivity.controller';
import { getEvents } from '../controllers/event/getEvents.controller';
import { getEvent } from '../controllers/event/getEvent.controller';
import { createEvent } from '../controllers/event/createEvent.controller';
import { updateEvent } from '../controllers/event/updateEvent.controller';
import { deleteEvent } from '../controllers/event/deleteEvent.controller';
import {
  getIncidentActivity,
  getEventActivity,
  getOperationalActivityActivity,
} from '../controllers/activity/getEntityActivity.controller';
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '../controllers/profile.controller';
import { getMyPermissions } from '../controllers/permissions.controller';
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
  setUserRoles,
  listPermissionCodes,
} from '../controllers/accessManagement.controller';
import { reportController } from '../controllers/report.controller';
import { explanatoryNoteController } from '../controllers/explanatoryNote/explanatoryNote.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { allowAccessManagement } from '../middlewares/accessManagement.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../enums/permissions';

const router = Router();

// Все API требуют аутентификации (Keycloak JWT)
router.use(verifyToken);

// Departments
router
  .route('/departments')
  .get(requirePermission([Permission.DEPARTMENT_LIST]), departmentController.getDepartments)
  .post(requirePermission([Permission.DEPARTMENT_CREATE]), departmentController.createDepartment);

router
  .route('/departments/:id')
  .get(requirePermission([Permission.DEPARTMENT_READ]), departmentController.getDepartment)
  .put(requirePermission([Permission.DEPARTMENT_UPDATE]), departmentController.updateDepartment)
  .delete(requirePermission([Permission.DEPARTMENT_DELETE]), departmentController.deleteDepartment);

// Incidents
router
  .route('/incidents')
  .get(requirePermission([Permission.INCIDENT_LIST]), getIncidents)
  .post(requirePermission([Permission.INCIDENT_CREATE]), createIncident);

router
  .route('/incidents/:id')
  .get(requirePermission([Permission.INCIDENT_READ]), getIncident)
  .put(
    requirePermission([
      Permission.INCIDENT_UPDATE,
      Permission.ADDITIONALLY_CREATE,
      Permission.ADDITIONALLY_UPDATE,
      Permission.ADDITIONALLY_DELETE,
    ]),
    updateIncident
  )
  .delete(requirePermission([Permission.INCIDENT_DELETE]), deleteIncident);

router.get(
  '/incidents/:id/activity',
  requirePermission([Permission.INCIDENT_READ]),
  getIncidentActivity
);

// Incident attachments
router
  .route('/incidents/:id/attachments')
  .get(requirePermission([Permission.INCIDENT_ATTACHMENTS]), getIncidentAttachments)
  .post(requirePermission([Permission.INCIDENT_ATTACHMENTS]), upload.array('files', 10), uploadIncidentAttachments);

router
  .route('/incidents/:id/attachments/:attachmentId/download')
  .get(requirePermission([Permission.INCIDENT_ATTACHMENTS]), downloadIncidentAttachment);

router
  .route('/incidents/:id/attachments/:attachmentId')
  .delete(requirePermission([Permission.INCIDENT_ATTACHMENTS]), deleteIncidentAttachment);

// Incident event attachments
router
  .route('/incident-events/:incidentEventId/attachments')
  .get(requirePermission([Permission.INCIDENT_ATTACHMENTS]), getIncidentEventAttachments)
  .post(requirePermission([Permission.INCIDENT_ATTACHMENTS]), upload.array('files', 10), uploadIncidentEventAttachments);

router
  .route('/incident-events/:incidentEventId/attachments/:attachmentId/download')
  .get(requirePermission([Permission.INCIDENT_ATTACHMENTS]), downloadIncidentEventAttachment);

router
  .route('/incident-events/:incidentEventId/attachments/:attachmentId')
  .delete(requirePermission([Permission.INCIDENT_ATTACHMENTS]), deleteIncidentEventAttachment);

// Operational activities
router
  .route('/operational-activities')
  .get(requirePermission([Permission.OPERATIONAL_ACTIVITY_LIST]), getOperationalActivities)
  .post(requirePermission([Permission.OPERATIONAL_ACTIVITY_CREATE]), createOperationalActivity);

router
  .route('/operational-activities/:id')
  .get(requirePermission([Permission.OPERATIONAL_ACTIVITY_READ]), getOperationalActivity)
  .put(requirePermission([Permission.OPERATIONAL_ACTIVITY_UPDATE]), updateOperationalActivity)
  .delete(requirePermission([Permission.OPERATIONAL_ACTIVITY_DELETE]), deleteOperationalActivity);

router.get(
  '/operational-activities/:id/activity',
  requirePermission([Permission.OPERATIONAL_ACTIVITY_READ]),
  getOperationalActivityActivity
);

// Event types (типы событий инцидентов)
router
  .route('/event-types')
  .get(requirePermission([Permission.EVENT_TYPE_LIST]), incidentEventTypeController.getIncidentEventTypes)
  .post(requirePermission([Permission.EVENT_TYPE_CREATE]), incidentEventTypeController.createIncidentEventType);

router
  .route('/event-types/:id')
  .get(requirePermission([Permission.EVENT_TYPE_READ]), incidentEventTypeController.getIncidentEventType)
  .put(requirePermission([Permission.EVENT_TYPE_UPDATE]), incidentEventTypeController.updateIncidentEventType)
  .delete(requirePermission([Permission.EVENT_TYPE_DELETE]), incidentEventTypeController.deleteIncidentEventType);

// Object types
router
  .route('/object-types')
  .get(requirePermission([Permission.OBJECT_TYPE_LIST]), objectTypeController.getObjectTypes)
  .post(requirePermission([Permission.OBJECT_TYPE_CREATE]), objectTypeController.createObjectType);

router
  .route('/object-types/:id')
  .get(requirePermission([Permission.OBJECT_TYPE_READ]), objectTypeController.getObjectType)
  .put(requirePermission([Permission.OBJECT_TYPE_UPDATE]), objectTypeController.updateObjectType)
  .delete(requirePermission([Permission.OBJECT_TYPE_DELETE]), objectTypeController.deleteObjectType);

// Objects
router
  .route('/objects')
  .get(requirePermission([Permission.OBJECT_LIST]), objectsController.getObjects)
  .post(requirePermission([Permission.OBJECT_CREATE]), objectsController.createObject);

router
  .route('/objects/:id')
  .get(requirePermission([Permission.OBJECT_READ]), objectsController.getObject)
  .put(requirePermission([Permission.OBJECT_UPDATE]), objectsController.updateObject)
  .delete(requirePermission([Permission.OBJECT_DELETE]), objectsController.deleteObject);

// Events
router
  .route('/events')
  .get(requirePermission([Permission.EVENT_LIST]), getEvents)
  .post(requirePermission([Permission.EVENT_CREATE]), createEvent);

router
  .route('/events/:id')
  .get(requirePermission([Permission.EVENT_READ]), getEvent)
  .put(requirePermission([Permission.EVENT_UPDATE]), updateEvent)
  .delete(requirePermission([Permission.EVENT_DELETE]), deleteEvent);

router.get(
  '/events/:id/activity',
  requirePermission([Permission.EVENT_READ]),
  getEventActivity
);

// Профиль — по правам profile.read / profile.update; список своих прав — всем аутентифицированным
router.get('/profile/me', getMyProfile);
router.put('/profile/me', requirePermission([Permission.PROFILE_UPDATE]), updateMyProfile);
router.post('/profile/photo', requirePermission([Permission.PROFILE_UPDATE]), upload.single('file'), uploadProfilePhoto);
router.get('/profile/me/permissions', getMyPermissions);

// Access management (bootstrap: если ни у кого нет права — доступ разрешён)
router.get('/access/permissions', allowAccessManagement, listPermissionCodes);
router.get('/access/roles', allowAccessManagement, listRoles);
router.get('/access/roles/:id', allowAccessManagement, getRole);
router.post('/access/roles', allowAccessManagement, createRole);
router.put('/access/roles/:id', allowAccessManagement, updateRole);
router.delete('/access/roles/:id', allowAccessManagement, deleteRole);
router.get('/access/users', allowAccessManagement, listUsers);
router.put('/access/users/:external_id/roles', allowAccessManagement, setUserRoles);

// Reports
router.post('/reports/generate', requirePermission([Permission.REPORT_GENERATE]), reportController.generateReport);
router.get('/reports/fields', requirePermission([Permission.REPORT_TABLE, Permission.REPORT_GENERATE]), reportController.getAvailableFields);
router.post('/reports/table', requirePermission([Permission.REPORT_TABLE]), reportController.getReportTable);
router.post('/reports/export', requirePermission([Permission.REPORT_EXPORT]), reportController.exportReport);
router.post('/reports/export-dashboard', requirePermission([Permission.REPORT_DASHBOARD]), reportController.exportDashboard);

// Explanatory notes
router
  .route('/explanatory-notes')
  .get(requirePermission([Permission.EXPLANATORY_NOTE_LIST]), explanatoryNoteController.getExplanatoryNotes)
  .post(requirePermission([Permission.EXPLANATORY_NOTE_CREATE]), explanatoryNoteController.createExplanatoryNote);
router.get('/explanatory-notes/export', requirePermission([Permission.EXPLANATORY_NOTE_EXPORT]), explanatoryNoteController.exportExplanatoryNotes);

router
  .route('/explanatory-notes/:id')
  .get(requirePermission([Permission.EXPLANATORY_NOTE_READ]), explanatoryNoteController.getExplanatoryNote)
  .put(requirePermission([Permission.EXPLANATORY_NOTE_UPDATE]), explanatoryNoteController.updateExplanatoryNote)
  .delete(requirePermission([Permission.EXPLANATORY_NOTE_DELETE]), explanatoryNoteController.deleteExplanatoryNote);

export default router;
