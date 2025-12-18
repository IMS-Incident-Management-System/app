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
import { getOperationalActivities } from '../controllers/operationalActivity/getOperationalActivities.controller';
import { createOperationalActivity } from '../controllers/operationalActivity/createOperationalActivity.controller';
import { getOperationalActivity } from '../controllers/operationalActivity/getOperationalActivity.controller';
import { updateOperationalActivity } from '../controllers/operationalActivity/updateOperationalActivity.controller';
import { deleteOperationalActivity } from '../controllers/operationalActivity/deleteOperationalActivity.controller';

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

export default router;
