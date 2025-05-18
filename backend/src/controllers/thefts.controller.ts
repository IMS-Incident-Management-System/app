import { Request } from 'express';
import { theftsService } from '../services/thefts.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { TheftsCreationAttributes } from '../models/thefts';

export const theftsController = {
  getThefts: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const thefts = await theftsService.getThefts();
    res.success(thefts, 'Thefts retrieved successfully');
  }),

  getTheftsById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const thefts = await theftsService.getTheftsById(Number(id));

    if (!thefts) {
      throw ApiError.notFound('Thefts not found');
    }

    res.success(thefts, 'Thefts retrieved successfully');
  }),

  createThefts: asyncErrorHandler(async (req: Request<{}, {}, TheftsCreationAttributes>, res: CustomResponse) => {
    const { object, damage_amount, criminal_case } = req.body;
    if (!object || !damage_amount || !criminal_case) {
      throw ApiError.badRequest('Object, damage_amount, and criminal_case are required');
    }
    const thefts = await theftsService.createThefts(req.body);
    res.created(thefts, 'Thefts created successfully');
  }),

  updateThefts: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const thefts = await theftsService.updateThefts(Number(id), req.body);

    if (!thefts) {
      throw ApiError.badRequest('Thefts not found');
    }

    res.success(thefts, 'Thefts updated successfully');
  }),

  deleteThefts: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await theftsService.deleteThefts(Number(id));

    if (!result) {
      throw ApiError.badRequest('Thefts not found');
    }

    res.noContent();
  }),
};