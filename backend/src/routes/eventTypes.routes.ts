import router from './router.instance';
import { eventTypeController } from '../controllers/eventType.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/event-types',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  eventTypeController.getEventTypes
);

router.get(
  '/event-types/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  eventTypeController.getEventType
);

router.post(
  '/event-types',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  eventTypeController.createEventType
);

router.put(
  '/event-types/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  eventTypeController.updateEventType
);

router.delete(
  '/event-types/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  eventTypeController.deleteEventType
);

export default router;