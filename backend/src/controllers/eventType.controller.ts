import { Request } from 'express';
import { ApiError } from '../middlewares/errorHandler.middleware';
import { EEventType } from '../enums/eventTypes';
import { eventTypeService } from '../services/eventType.service';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';

interface CreateEventTypeBody {
  type: EEventType;
  name: string;
}

export const eventTypeController = {
  getEventTypes: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const types = await eventTypeService.getEventTypes();
      res.success(types, 'Event types retrieved successfully');
    }
  ),

  getEventType: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const type = await eventTypeService.getEventType(Number(id));

    if (!type) {
      throw ApiError.notFound('Event type not found');
    }

    res.success(type, 'Event type retrieved successfully');
  }),

  createEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const data = req.body as CreateEventTypeBody;

      const type = await eventTypeService.createEventType(data);
      res.created(type, 'Event type created successfully');
    }
  ),

  updateEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const data = req.body as Partial<CreateEventTypeBody>;

      const type = await eventTypeService.updateEventType(Number(id), data);
      if (!type) {
        throw ApiError.notFound('Event type not found');
      }
      res.success(type, 'Event type updated successfully');
    }
  ),

  deleteEventType: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await eventTypeService.deleteEventType(Number(id));

      if (!result) {
        throw ApiError.notFound('Event type not found');
      }

      res.noContent();
    }
  ),
};
