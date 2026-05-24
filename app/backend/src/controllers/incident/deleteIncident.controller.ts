import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';

export const deleteIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await incidentService.deleteIncident(Number(id));

    if (!result) {
      throw ApiError.notFound('Incident not found');
    }

    res.noContent();
  }
);
