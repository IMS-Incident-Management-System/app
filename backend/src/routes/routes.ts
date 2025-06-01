import { Router } from 'express';
import { departmentController } from '../controllers/department.controller';
import { incidentController } from '../controllers/incident.controller';
import { eventTypeController } from '../controllers/eventType.controller';
import { objectsController } from '../controllers/object.controller';
import { theftTypeController } from '../controllers/incidentEvents/theft.controller';

const router = Router();

// Departments routes
router.route('/departments')
  .get(departmentController.getDepartments)
  .post(departmentController.createDepartment);

router.route('/departments/:id')
  .get(departmentController.getDepartment)
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

// Incidents routes
router.route('/incidents')
  .get(incidentController.getIncidents)
  .post(incidentController.createIncident);

router.route('/incidents/:id')
  .get(incidentController.getIncident)
  .put(incidentController.updateIncident)
  .delete(incidentController.deleteIncident);

// Event types routes
router.route('/event-types')
  .get(eventTypeController.getEventTypes)
  .post(eventTypeController.createEventType);

router.route('/event-types/:id')
  .get(eventTypeController.getEventType)
  .put(eventTypeController.updateEventType)
  .delete(eventTypeController.deleteEventType);

// Objects routes
router.route('/objects')
  .get(objectsController.getObjects)
  .post(objectsController.createObject);

router.route('/objects/:id')
  .get(objectsController.getObject)
  .put(objectsController.updateObject)
  .delete(objectsController.deleteObject);

// Theft routes
router.route('/thefts')
  .get(theftTypeController.getTheftTypes)
  .post(theftTypeController.createTheftType);

router.route('/thefts/:id')
  .get(theftTypeController.getTheftType)
  .put(theftTypeController.updateTheftType)
  .delete(theftTypeController.deleteTheftType);

export default router;