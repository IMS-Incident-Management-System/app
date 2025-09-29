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
    // персональные данные
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    employee_number?: string;
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

    if (!data.department_id || !data.direction || !data.message) {
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

      // 2. Создаем события и уголовные дела (если переданы)
      await Promise.all(
        (data.events ?? []).map(async (eventData) => {
          // Создаем событие
          const event = await eventHistoryService.createEvent(
            {
              incident_id: incident.id,
              event_type_id: eventData.event_type_id,
              sub_type_id: eventData.sub_type_id,
              // адрес
              city: eventData.city,
              street: eventData.street,
              house: eventData.house,
              building: eventData.building,
              // apartment удалён
              number: (eventData as any).number,
              // персональные данные
              last_name: eventData.last_name,
              first_name: eventData.first_name,
              middle_name: eventData.middle_name,
              employee_number: eventData.employee_number,
              // источник
              source_last_name: (eventData as any).source_last_name,
              source_first_name: (eventData as any).source_first_name,
              source_middle_name: (eventData as any).source_middle_name,
              source_position: (eventData as any).source_position,
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

      // 3. Создаем наказания (нормализуем входные данные и подставляем дефолты)
      const normalizedPunishments = (data.punishments ?? [])
        .filter((p) => Boolean(p))
        .map((p: any) => ({
          // Если не пришёл тип наказания — подставляем общий тип = 1
          punishment_type_id: typeof p.punishment_type_id === 'number' ? p.punishment_type_id : 1,
          description: p.description,
          date: p.date ? new Date(p.date) : new Date(),
          fired_count: Number.isFinite(p.fired_count) ? p.fired_count : 0,
          guilty_persons_count: Number.isFinite(p.guilty_persons_count) ? p.guilty_persons_count : 0,
          punished_persons_count: Number.isFinite(p.punished_persons_count) ? p.punished_persons_count : 0,
          warnings_count: Number.isFinite(p.warnings_count) ? p.warnings_count : 0,
          reprimands_count: Number.isFinite(p.reprimands_count) ? p.reprimands_count : 0,
          severe_reprimands_count: Number.isFinite(p.severe_reprimands_count) ? p.severe_reprimands_count : 0,
        }));

      if (normalizedPunishments.length) {
        await Promise.all(
          normalizedPunishments.map((punishmentData) =>
            punishmentService.createPunishment(
              { ...punishmentData, incident_id: incident.id },
              { transaction }
            )
          )
        );
      }

      // 6. Собираем ответ
      return {
        incident,
        events: data.events ?? [],
        punishments: data.punishments,
      };
    });

    res.created(result, 'Incident created successfully');
  }
);
