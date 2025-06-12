import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { sequelize } from '../../models';

export const updateIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    
    const transaction = await sequelize.transaction();
    
    try {
      const incident = await incidentService.updateIncident(
        Number(id), 
        req.body,
        { transaction }
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      await transaction.commit();
      res.success(incident, 'Incident updated successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
);
