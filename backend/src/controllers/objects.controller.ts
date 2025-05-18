import { Request } from 'express';
import { objectsService } from '../services/objects.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { ObjectsCreationAttributes } from '../models/objects';

export const objectsController = {
  getObjects: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const objects = await objectsService.getObjects();
    res.success(objects, 'Objects retrieved successfully');
  }),

  getObjectsById: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const objects = await objectsService.getObjectsById(Number(id));

    if (!objects) {
      throw ApiError.notFound('Objects not found');
    }

    res.success(objects, 'Objects retrieved successfully');
  }),

  createObjects: asyncErrorHandler(async (req: Request<{}, {}, ObjectsCreationAttributes>, res: CustomResponse) => {
    const objects = await objectsService.createObjects(req.body);
    res.created(objects, 'Objects created successfully');
  }),

  updateObjects: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const objects = await objectsService.updateObjects(Number(id), req.body);

    if (!objects) {
      throw ApiError.notFound('Objects not found');
    }

    res.success(objects, 'Objects updated successfully');
  }),

  deleteObjects: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await objectsService.deleteObjects(Number(id));

    if (!result) {
      throw ApiError.notFound('Objects not found');
    }

    res.noContent();
  }),
};