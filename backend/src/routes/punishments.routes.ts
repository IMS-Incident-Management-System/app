import router from './router.instance';
import { punishmentsController } from '../controllers/punishments.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/punishments',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  punishmentsController.getPunishments
);

router.get(
  '/punishments/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  punishmentsController.getPunishmentsById
);

router.post(
  '/punishments',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  punishmentsController.createPunishments
);

router.put(
  '/punishments/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  punishmentsController.updatePunishments
);

router.delete(
  '/punishments/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  punishmentsController.deletePunishments
);

export default router;