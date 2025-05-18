import { Request } from 'express';
import { damagesService } from '../services/damages.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { DamagesCreationAttributes } from '../models/damages';

export const damagesController = {
  getDamages: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const damages = await damagesService.getDamages();
    res.success(damages, 'Damages retrieved successfully');
  }),

  getDamagesById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const damages = await damagesService.getDamagesById(Number(id));

    if (!damages) {
      throw ApiError.notFound('Damages not found');
    }

    res.success(damages, 'Damages retrieved successfully');
  }),

  createDamages: asyncErrorHandler(async (req: Request<{}, {}, DamagesCreationAttributes>, res: CustomResponse) => {
    const { object, damage_type, damage_amount } = req.body;
    if (!object || !damage_type || !damage_amount) {
      throw ApiError.badRequest('Object, damage_type, and damage_amount are required');
    }
    const damages = await damagesService.createDamages(req.body);
    res.created(damages, 'Damages created successfully');
  }),

  updateDamages: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const damages = await damagesService.updateDamages(Number(id), req.body);

    if (!damages) {
      throw ApiError.notFound('Damages not found');
    }

    res.success(damages, 'Damages updated successfully');
  }),

  deleteDamages: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await damagesService.deleteDamages(Number(id));

    if (!result) {
      throw ApiError.notFound('Damages not found');
    }

    res.noContent();
  }),
};