import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
import { EventDirectionEnum } from '../../enums/event';
import { EventCategoryType } from '../../models/event';

interface UpdateEventBody {
  department_id?: number;
  period_date?: Date;
  direction?: EventDirectionEnum;
  category?: EventCategoryType;
  // Все остальные поля опциональны
  [key: string]: any;
}

export const updateEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const data = req.body as UpdateEventBody;

    // Если указан новый department_id, проверяем его существование
    if (data.department_id) {
      const departmentExists = await eventService.validateDepartment(data.department_id);
      if (!departmentExists) {
        throw ApiError.badRequest('Department not found');
      }
    }

    const event = await eventService.updateEvent(Number(id), data);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    res.success(event, 'Event updated successfully');
  }
);

