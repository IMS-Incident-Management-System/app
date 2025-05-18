import router from './router.instance';
import { uavsController } from '../controllers/uavs.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/uavs',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  uavsController.getUavs
);

router.get(
  '/uavs/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  uavsController.getUavsById
);

router.post(
  '/uavs',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  uavsController.createUavs
);

router.put(
  '/uavs/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  uavsController.updateUavs
);

router.delete(
  '/uavs/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  uavsController.deleteUavs
);

export default router;