import router from './router.instance';
import { incidentController } from '../controllers/incident.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/incidents',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  incidentController.getIncidents
);

router.get(
  '/incidents/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  incidentController.getIncident
);

router.post(
  '/incidents',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  incidentController.createIncident
);

router.put(
  '/incidents/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  incidentController.updateIncident
);

router.delete(
  '/incidents/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  incidentController.deleteIncident
);

export default router; 