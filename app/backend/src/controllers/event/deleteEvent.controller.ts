import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';

export const deleteEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const result = await eventService.deleteEvent(Number(id));

    if (!result) {
      throw ApiError.notFound('Event not found');
    }

    res.noContent();
  }
);

