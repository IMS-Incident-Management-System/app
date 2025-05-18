import router from './router.instance';
import { firesController } from '../controllers/fires.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/fires',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  firesController.getFires
);

router.get(
  '/fires/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  firesController.getFiresById
);

router.post(
  '/fires',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  firesController.createFires
);

router.put(
  '/fires/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  firesController.updateFires
);

router.delete(
  '/fires/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  firesController.deleteFires
);

export default router;