import { Request } from 'express';
import { uavsService } from '../services/uavs.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { UavsCreationAttributes } from '../models/uavs';

export const uavsController = {
  getUavs: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const uavs = await uavsService.getUavs();
    res.success(uavs, 'Uavs retrieved successfully');
  }),

  getUavsById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const uavs = await uavsService.getUavsById(Number(id));

    if (!uavs) {
      throw ApiError.notFound('Uavs not found');
    }

    res.success(uavs, 'Uavs retrieved successfully');
  }),

  createUavs: asyncErrorHandler(async (req: Request<{}, {}, UavsCreationAttributes>, res: CustomResponse) => {
    const { object, uav_type, circumstances } = req.body;
    if (!object || !uav_type || !circumstances) {
      throw ApiError.badRequest('Object, uav_type, and circumstances are required');
    }
    const uavs = await uavsService.createUavs(req.body);
    res.created(uavs, 'Uavs created successfully');
  }),

  updateUavs: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const uavs = await uavsService.updateUavs(Number(id), req.body);

    if (!uavs) {
      throw ApiError.notFound('Uavs not found');
    }

    res.success(uavs, 'Uavs updated successfully');
  }),

  deleteUavs: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await uavsService.deleteUavs(Number(id));

    if (!result) {
      throw ApiError.notFound('Uavs not found');
    }

    res.noContent();
  }),
};