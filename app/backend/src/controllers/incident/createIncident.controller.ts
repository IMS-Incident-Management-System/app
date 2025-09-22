import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { SecurityDirectionEnum } from '../../models/incident';
import { eventHistoryService } from '../../services/eventHistory.service';
import { criminalCaseService } from '../../services/criminalCase.service';
import { punishmentService } from '../../services/punishment.service';
import { sequelize } from '../../models/sequelize';

interface CreateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  message: string;
  is_db: boolean;
  events: Array<{
    event_type_id: number;
    sub_type_id?: number;
    // адрес
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    apartment?: string;
    // ущерб
    detected_damage: number;
    prevented_damage: number;
    recovered_damage: number;
    description?: string;
    date: Date;
    criminal_cases?: Array<{
      transfer_date?: Date;
      document_number?: string;
      department_name?: string;
      review_result?: string;
      case_number?: string;
      law_article?: string;
      [key: string]: any;
    }>;
  }>;
  punishments: Array<{
    punishment_type_id: number;
    description?: string;
    date: Date;
    fired_count: number;
  }>;
}

export const createIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateIncidentBody;

    if (!data.department_id || !data.direction || !data.message || !data.events.length) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Создаем инцидент
      const incident = await incidentService.createIncident(
        {
          department_id: data.department_id,
          direction: data.direction,
          object_type_id: data.object_type_id,
          message: data.message,
          is_db: Boolean(data.is_db),
        },
        { transaction }
      );

      // 2. Создаем события и уголовные дела
      await Promise.all(
        data.events.map(async (eventData) => {
          // Создаем событие
          const event = await eventHistoryService.createEvent(
            {
              incident_id: incident.id,
              event_type_id: eventData.event_type_id,
              sub_type_id: eventData.sub_type_id,
              city: eventData.city,
              street: eventData.street,
              house: eventData.house,
              building: eventData.building,
              apartment: eventData.apartment,
              detected_damage: eventData.detected_damage,
              prevented_damage: eventData.prevented_damage,
              recovered_damage: eventData.recovered_damage,
              description: eventData.description,
              date: eventData.date,
            },
            { transaction }
          );

          // Если есть уголовные дела, создаем их
          if (eventData.criminal_cases?.length) {
            await Promise.all(
              eventData.criminal_cases.map((caseData) =>
                criminalCaseService.createCriminalCase(
                  {
                    event_history_id: event.id,
                    ...caseData,
                  },
                  { transaction }
                )
              )
            );
          }

          return event;
        })
      );

      // 3. Создаем наказания
      data.punishments?.length
        ? await Promise.all(
            data.punishments.map((punishmentData) =>
              punishmentService.createPunishment(
                { ...punishmentData, incident_id: incident.id },
                {
                  transaction,
                }
              )
            )
          )
        : [];

      // 6. Получаем инцидент со всеми связями
      return {
        incident,
        events: data.events,
        punishments: data.punishments,
      };
    });

    res.success(null, 'Incident created successfully');
  }
);
