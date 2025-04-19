import { Request } from 'express';
import { UserRoles } from '../enums/roles';
import { User } from '../interfaces/user';

interface RequestWithUser extends Request {
  user?: User;
}

export const rolesGuard = (allowedRoles: UserRoles[]) => {
  return (req: RequestWithUser, res, next) => {
    try {
      const userRoles = req.user?.realm_roles;

      if (!userRoles || !Array.isArray(userRoles)) {
        return res.status(401).json({
          message: 'Unauthorized - User roles not found',
        });
      }

      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Forbidden - Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error while checking permissions',
      });
    }
  };
};
