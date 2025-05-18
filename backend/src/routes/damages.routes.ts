import router from './router.instance';
import { damagesController } from '../controllers/damages.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/damages',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  damagesController.getDamages
);

router.get(
  '/damages/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  damagesController.getDamagesById
);

router.post(
  '/damages',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  damagesController.createDamages
);

router.put(
  '/damages/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  damagesController.updateDamages
);

router.delete(
  '/damages/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  damagesController.deleteDamages
);

export default router;