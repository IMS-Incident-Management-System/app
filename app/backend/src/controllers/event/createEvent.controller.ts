import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
import { EventDirectionEnum } from '../../enums/event';
import { EventCategoryType } from '../../models/event';

interface CreateEventBody {
  department_id: number;
  period_date: Date;
  direction: EventDirectionEnum;
  category: EventCategoryType;
  // Все остальные поля опциональны и зависят от категории
  [key: string]: any;
}

export const createEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateEventBody;
    const user = (req as any).user; // Данные пользователя из middleware

    if (!data.department_id || !data.period_date || !data.direction || !data.category) {
      throw ApiError.badRequest('Missing required fields: department_id, period_date, direction, category');
    }

    // Проверяем существование подразделения
    const departmentExists = await eventService.validateDepartment(data.department_id);
    if (!departmentExists) {
      throw ApiError.badRequest('Department not found');
    }

    // Создаем событие с ID пользователя
    const event = await eventService.createEvent({
      ...data,
      created_by: user?.sub || user?.preferred_username || undefined,
    });

    res.created(event, 'Event created successfully');
  }
);

