import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { SecurityDirectionEnum } from '../../models/incident';
import { eventHistoryService } from '../../services/eventHistory.service';
import { additionallyService } from '../../services/additionally.service';
import { sequelize } from '../../models/sequelize';

interface CreateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  is_db: boolean;
  event: {
    event_type_ids: number[];
    sub_type_id?: number;
    date: Date;
    entry_date?: Date;
    // адрес
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    apartment?: string;
    // персональные данные
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    employee_number?: string;
  };
  additionally: Array<{
    id?: number; // ID записи (исключается при создании)
    incident_date?: Date; // Дата происшествия
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    criminal_cases?: string; // Уголовные дела
    is_punished?: boolean; // Наказано
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
  }>
}

export const createIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateIncidentBody;

    if (!data.department_id || !data.direction) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Создаем инцидент
      const incident = await incidentService.createIncident(
        {
          department_id: data.department_id,
          direction: data.direction,
          object_type_id: data.object_type_id,
          is_db: Boolean(data.is_db),
        },
        { transaction }
      );

      

      // 2. Создаем события для каждого типа события
      const events = await Promise.all(
        data.event.event_type_ids.map((event_type_id) =>
          eventHistoryService.createEvent(
            {
              incident_id: incident.id,
              event_type_id: event_type_id,
              sub_type_id: data.event.sub_type_id,
              // адрес
              city: data.event.city,
              street: data.event.street,
              house: data.event.house,
              building: data.event.building,
              // персональные данные
              last_name: data.event.last_name,
              first_name: data.event.first_name,
              middle_name: data.event.middle_name,
              employee_number: data.event.employee_number,
              date: data.event.date,
              entry_date: data.event.entry_date,
            },
            { transaction }
          )
        )
      );

      if (data.additionally.length) {
        await Promise.all(
          data.additionally.map((additionallyData) => {
            // Исключаем id из данных при создании нового записи
            const { id, ...additionallyDataWithoutId } = additionallyData;
            return additionallyService.createAdditionally(
              { ...additionallyDataWithoutId, incident_id: incident.id },
              { transaction }
            );
          })
        );
      }

      // 6. Собираем ответ
      return {
        incident,
        events,
        additionallys: data.additionally ?? [],
      };
    });

    res.created(result, 'Incident created successfully');
  }
);
