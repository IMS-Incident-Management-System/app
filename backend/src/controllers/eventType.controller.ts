import { Request } from 'express';
import { eventTypeService } from '../services/eventType.service';
import { ApiError, asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { EventTypeCreationAttributes } from '../models/eventType';

export const eventTypeController = {
  getEventTypes: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const eventTypes = await eventTypeService.getEventTypes();
    res.success(eventTypes, 'Event types retrieved successfully');
  }),

  getEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const eventType = await eventTypeService.getEventType(Number(id));

    if (!eventType) {
      throw ApiError.notFound('Event type not found');
    }

    res.success(eventType, 'Event type retrieved successfully');
  }),

  createEventType: asyncErrorHandler(async (req: Request<{}, {}, EventTypeCreationAttributes>, res: CustomResponse) => {
    const { name } = req.body;
    if (!name) {
      throw ApiError.badRequest('Name is required');
    }
    const eventType = await eventTypeService.createEventType(req.body);
    res.created(eventType, 'Event type created successfully');
  }),

  updateEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const eventType = await eventTypeService.updateEventType(Number(id), req.body);

    if (!eventType) {
      throw ApiError.notFound('Event type not found');
    }

    res.success(eventType, 'Event type updated successfully');
  }),

  deleteEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await eventTypeService.deleteEventType(Number(id));

    if (!result) {
      throw ApiError.notFound('Event type not found');
    }

    res.noContent();
  }),
};