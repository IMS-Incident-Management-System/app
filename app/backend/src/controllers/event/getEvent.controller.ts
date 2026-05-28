import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
import { entityMetaService } from '../../services/entityMeta.service';

export const getEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const event = await eventService.getEvent(Number(id));

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const meta = await entityMetaService.buildMetaDto(event);
    const payload = { ...(event.toJSON?.() ?? event), meta };
    res.success(payload, 'Event retrieved successfully');
  }
);

