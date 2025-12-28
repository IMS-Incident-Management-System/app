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
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '../controllers/profile.controller';
import { reportController } from '../controllers/report.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Departments routes
router
  .route('/departments')
  .get(departmentController.getDepartments)
  .post(departmentController.createDepartment);

router
  .route('/departments/:id')
  .get(departmentController.getDepartment)
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

// Incidents routes
router.route('/incidents').get(getIncidents).post(createIncident);

router
  .route('/incidents/:id')
  .get(getIncident)
  .put(updateIncident)
  .delete(deleteIncident);

// Incident attachments routes
router
  .route('/incidents/:id/attachments')
  .get(getIncidentAttachments)
  .post(upload.array('files', 10), uploadIncidentAttachments);

router
  .route('/incidents/:id/attachments/:attachmentId/download')
  .get(downloadIncidentAttachment);

router
  .route('/incidents/:id/attachments/:attachmentId')
  .delete(deleteIncidentAttachment);

// Incident event attachments routes
router
  .route('/incident-events/:incidentEventId/attachments')
  .get(getIncidentEventAttachments)
  .post(upload.array('files', 10), uploadIncidentEventAttachments);

router
  .route('/incident-events/:incidentEventId/attachments/:attachmentId/download')
  .get(downloadIncidentEventAttachment);

router
  .route('/incident-events/:incidentEventId/attachments/:attachmentId')
  .delete(deleteIncidentEventAttachment);

// Operational activities routes
router.route('/operational-activities').get(getOperationalActivities).post(createOperationalActivity);

router
  .route('/operational-activities/:id')
  .get(getOperationalActivity)
  .put(updateOperationalActivity)
  .delete(deleteOperationalActivity);

// Incident event types routes
router
  .route('/event-types')
  .get(incidentEventTypeController.getIncidentEventTypes)
  .post(incidentEventTypeController.createIncidentEventType);

router
  .route('/event-types/:id')
  .get(incidentEventTypeController.getIncidentEventType)
  .put(incidentEventTypeController.updateIncidentEventType)
  .delete(incidentEventTypeController.deleteIncidentEventType);

// Object types routes
router
  .route('/object-types')
  .get(objectTypeController.getObjectTypes)
  .post(objectTypeController.createObjectType);

router
  .route('/object-types/:id')
  .get(objectTypeController.getObjectType)
  .put(objectTypeController.updateObjectType)
  .delete(objectTypeController.deleteObjectType);

// Objects routes
router
  .route('/objects')
  .get(objectsController.getObjects)
  .post(objectsController.createObject);

router
  .route('/objects/:id')
  .get(objectsController.getObject)
  .put(objectsController.updateObject)
  .delete(objectsController.deleteObject);

// Events routes
router.route('/events').get(getEvents).post(createEvent);

router
  .route('/events/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

// Profile routes (требуют аутентификации через Keycloak)
router.get('/profile/me', verifyToken, getMyProfile);
router.put('/profile/me', verifyToken, updateMyProfile);
router.post('/profile/photo', verifyToken, upload.single('file'), uploadProfilePhoto);

// Report routes
router.post('/reports/generate', reportController.generateReport);
router.get('/reports/fields', reportController.getAvailableFields);

export default router;
