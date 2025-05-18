import router from './router.instance';
import { objectsController } from '../controllers/objects.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/objects',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  objectsController.getObjects
);

router.get(
  '/objects/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  objectsController.getObjectsById
);

router.post(
  '/objects',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  objectsController.createObjects
);

router.put(
  '/objects/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  objectsController.updateObjects
);

router.delete(
  '/objects/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  objectsController.deleteObjects
);

export default router;