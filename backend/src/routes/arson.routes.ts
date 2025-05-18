import router from './router.instance';
import { arsonController } from '../controllers/arson.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/arson',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  arsonController.getArson
);

router.get(
  '/arson/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  arsonController.getArsonById
);

router.post(
  '/arson',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  arsonController.createArson
);

router.put(
  '/arson/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  arsonController.updateArson
);

router.delete(
  '/arson/:id',
  // rolesGuard([UserRoles.OFFICER_ODS]),
  arsonController.deleteArson
);

export default router;