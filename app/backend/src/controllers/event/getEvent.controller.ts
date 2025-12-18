import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';

export const getEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const event = await eventService.getEvent(Number(id));

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    res.success(event, 'Event retrieved successfully');
  }
);

