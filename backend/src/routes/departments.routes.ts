import router from './router.instance';
import { departmentController } from '../controllers/department.controller';
import { rolesGuard } from '../middlewares/rolesGuard.middleware';
import { UserRoles } from '../enums/roles';

router.get(
  '/departments',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  departmentController.getDepartments
);

router.get(
  '/departments/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  departmentController.getDepartment
);

router.post(
  '/departments',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  departmentController.createDepartment
);

router.put(
  '/departments/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  departmentController.updateDepartment
);

router.delete(
  '/departments/:id',
  //rolesGuard([UserRoles.OFFICER_ODS]),
  departmentController.deleteDepartment
);

export default router;
