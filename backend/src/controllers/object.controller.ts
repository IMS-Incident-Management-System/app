import { Request } from 'express';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { objectService } from '../services/object.service';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { ObjectCreationAttributes } from '../models/object';

export const objectsController = {
  getObjects: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const filters = {
      name: req.query.name as string,
      address: req.query.address as string,
    };

    const objects = await objectService.getObjects(filters);
    res.success(objects, 'Objects retrieved successfully');
  }),

  getObject: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const object = await objectService.getObject(Number(id));

    if (!object) {
      throw ApiError.notFound('Object not found');
    }

    res.success(object, 'Object retrieved successfully');
  }),

  createObject: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const data = req.body as ObjectCreationAttributes;

    const object = await objectService.createObject(data);
    res.created(object, 'Object created successfully');
  }),

  updateObject: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const data = req.body as Partial<ObjectCreationAttributes>;

    const object = await objectService.updateObject(Number(id), data);
    if (!object) {
      throw ApiError.notFound('Object not found');
    }
    res.success(object, 'Object updated successfully');
  }),

  deleteObject: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await objectService.deleteObject(Number(id));

    if (!result) {
      throw ApiError.notFound('Object not found');
    }

    res.noContent();
  }),

  searchObjects: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        throw ApiError.badRequest('Search query is required');
      }

      const objects = await objectService.searchObjects(query);
      res.success(objects, 'Objects found successfully');
    }
  ),
};
