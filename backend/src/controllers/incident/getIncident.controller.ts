import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';

export const getIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const incident = await incidentService.getIncident(Number(id));

    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }

    res.success(incident, 'Incident retrieved successfully');
  }
);
