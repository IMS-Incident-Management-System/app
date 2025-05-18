import { Request } from 'express';
import { arsonService } from '../services/arson.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { ArsonCreationAttributes } from '../models/arson';

export const arsonController = {
  getArson: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const arson = await arsonService.getArson();
    res.success(arson, 'Arson retrieved successfully');
  }),

  getArsonById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const arson = await arsonService.getArsonById(Number(id));

    if (!arson) {
      throw ApiError.notFound('Arson not found');
    }

    res.success(arson, 'Arson retrieved successfully');
  }),

  createArson: asyncErrorHandler(async (req: Request<{}, {}, ArsonCreationAttributes>, res: CustomResponse) => {
    const { object, cause, damage_amount } = req.body;
    if (!object || !cause || !damage_amount) {
      throw ApiError.badRequest('Object, cause, and damage_amount are required');
    }
    const arson = await arsonService.createArson(req.body);
    res.created(arson, 'Arson created successfully');
  }),

  updateArson: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const arson = await arsonService.updateArson(Number(id), req.body);

    if (!arson) {
      throw ApiError.notFound('Arson not found');
    }

    res.success(arson, 'Arson updated successfully');
  }),

  deleteArson: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await arsonService.deleteArson(Number(id));

    if (!result) {
      throw ApiError.notFound('Arson not found');
    }

    res.noContent();
  }),
};