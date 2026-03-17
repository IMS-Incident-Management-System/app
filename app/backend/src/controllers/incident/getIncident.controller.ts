import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { userHasAnyPermission } from '../../services/permission.service';
import { Permission } from '../../enums/permissions';

export const getIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const incident = await incidentService.getIncident(Number(id));

    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }

    const sub = (req as any).user?.sub;
    const canReadAdditionally = sub
      ? await userHasAnyPermission(sub, [Permission.ADDITIONALLY_READ])
      : false;
    if (!canReadAdditionally && incident) {
      (incident as any).additionally = [];
    }

    res.success(incident, 'Incident retrieved successfully');
  }
);
