import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import {
  IncidentStatusEnum,
  SecurityDirectionEnum,
} from '../../models/incident';
import { eventHistoryService } from '../../services/eventHistory.service';
import { criminalCaseService } from '../../services/criminalCase.service';
import { punishmentService } from '../../services/punishment.service';
import { sequelize } from '../../models/sequelize';

interface CreateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_id: number;
  message: string;
  is_db: boolean;
  status: IncidentStatusEnum;
  events: Array<{
    event_type_id: number;
    sub_type_id?: number;
    damage_amount: number;
    object_id: number;
    compensation_amount: number;
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
  punishments?: Array<{
    guilty_persons_count: number;
    punished_persons_count: number;
    warnings_count: number;
    reprimands_count: number;
    severe_reprimands_count: number;
    fired_count: number;
    date: Date;
  }>;
}

export const createIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateIncidentBody;

    if (
      !data.department_id ||
      !data.direction ||
      !data.object_id ||
      !data.message ||
      !data.events.length
    ) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Создаем инцидент
      const incident = await incidentService.createIncident(
        {
          department_id: data.department_id,
          direction: data.direction,
          object_id: data.object_id,
          message: data.message,
          is_db: Boolean(data.is_db),
          status: data.status || IncidentStatusEnum.DRAFT,
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
              ...eventData,
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

    res.created(result, 'Incident created successfully');
  }
);
