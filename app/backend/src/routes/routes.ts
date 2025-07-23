import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { eventTypeController } from '../controllers/eventType.controller';
import { objectsController } from '../controllers/object.controller';
import { getIncidents } from '../controllers/incident/getIncidents.controller';
import { createIncident } from '../controllers/incident/createIncident.controller';
import { getIncident } from '../controllers/incident/getIncident.controller';
import { updateIncident } from '../controllers/incident/updateIncident.controller';
import { deleteIncident } from '../controllers/incident/deleteIncident.controller';

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

// Event types routes
router
  .route('/event-types')
  .get(eventTypeController.getEventTypes)
  .post(eventTypeController.createEventType);

router
  .route('/event-types/:id')
  .get(eventTypeController.getEventType)
  .put(eventTypeController.updateEventType)
  .delete(eventTypeController.deleteEventType);

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
