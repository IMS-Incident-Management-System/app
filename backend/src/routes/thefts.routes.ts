import router from './router.instance';
import { theftsController } from '../controllers/thefts.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/thefts',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  theftsController.getThefts
);

router.get(
  '/thefts/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  theftsController.getTheftsById
);

router.post(
  '/thefts',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  theftsController.createThefts
);

router.put(
  '/thefts/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  theftsController.updateThefts
);

router.delete(
  '/thefts/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  theftsController.deleteThefts
);

export default router;