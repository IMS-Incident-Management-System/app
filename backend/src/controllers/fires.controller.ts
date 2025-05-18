import { Request } from 'express';
import { firesService } from '../services/fires.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { FiresCreationAttributes } from '../models/fires';

export const firesController = {
  getFires: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const fires = await firesService.getFires();
    res.success(fires, 'Fires retrieved successfully');
  }),

  getFiresById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const fires = await firesService.getFiresById(Number(id));

    if (!fires) {
      throw ApiError.notFound('Fires not found');
    }

    res.success(fires, 'Fires retrieved successfully');
  }),

  createFires: asyncErrorHandler(async (req: Request<{}, {}, FiresCreationAttributes>, res: CustomResponse) => {
    const { object, cause, damage_amount } = req.body;
    if (!object || !cause || !damage_amount) {
      throw ApiError.badRequest('Object, cause, and damage_amount are required');
    }
    const fires = await firesService.createFires(req.body);
    res.created(fires, 'Fires created successfully');
  }),

  updateFires: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const fires = await firesService.updateFires(Number(id), req.body);

    if (!fires) {
      throw ApiError.notFound('Fires not found');
    }

    res.success(fires, 'Fires updated successfully');
  }),

  deleteFires: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await firesService.deleteFires(Number(id));

    if (!result) {
      throw ApiError.notFound('Fires not found');
    }

    res.noContent();
  }),
};