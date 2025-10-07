import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { eventHistoryService } from '../../services/eventHistory.service';
import { additionallyService } from '../../services/additionally.service';
import { sequelize } from '../../models';
import { SecurityDirectionEnum } from '../../models/incident';

interface UpdateIncidentBody {
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

export const updateIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const data = req.body as UpdateIncidentBody;
    
    
    if (!data.department_id || !data.direction) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Обновляем инцидент
      const incident = await incidentService.updateIncident(
        Number(id),
        {
          department_id: data.department_id,
          direction: data.direction,
          object_type_id: data.object_type_id,
          is_db: Boolean(data.is_db),
        },
        { transaction }
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      // 2. Удаляем старые события и создаем новое
      // Удаляем все события для этого инцидента
      const deletedEventsCount = await eventHistoryService.deleteEventsByIncidentId(Number(id), { transaction });
      console.log(`Deleted ${deletedEventsCount} old events for incident ${id}`);
      
      // Создаем события для каждого типа события
      const events = await Promise.all(
        data.event.event_type_ids.map((event_type_id) =>
          eventHistoryService.createEvent(
            {
              incident_id: Number(id),
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

      // 3. Удаляем старые additionally и создаем новые
      await additionallyService.deleteAdditionallyByIncidentId(Number(id), { transaction });
      
      if (data.additionally.length) {
        await Promise.all(
          data.additionally.map((additionallyData) =>
            additionallyService.createAdditionally(
              { ...additionallyData, incident_id: Number(id) },
              { transaction }
            )
          )
        );
      }

      return {
        incident,
        events,
        additionallys: data.additionally ?? [],
      };
    });

    res.success(result, 'Incident updated successfully');
  }
);
