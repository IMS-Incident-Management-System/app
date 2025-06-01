import { Request } from 'express';
import { incidentService } from '../services/incident.service';
import { eventHistoryService } from '../services/eventHistory.service';
import {
  ApiError,
  asyncErrorHandler,
} from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import {
  SecurityDirectionEnum,
  IncidentStatusEnum,
  IncidentWithRelations,
  IncidentInstance,
} from '../models/incident';
import { sequelize } from '../models/sequelize';
import { criminalCaseService } from '../services/criminalCase.service';
import { punishmentService } from '../services/punishment.service';
import { ITable } from '../interfaces/common';

interface CreateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_id: number;
  message: string;
  is_db: boolean;
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

export const incidentController = {
  getIncidents: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const filters = {
      department_id: req.query.department_id
        ? Number(req.query.department_id)
        : undefined,
      direction: req.query.direction as SecurityDirectionEnum,
      status: req.query.status as IncidentStatusEnum,
      date_from: req.query.date_from
        ? new Date(req.query.date_from as string)
        : undefined,
      date_to: req.query.date_to
        ? new Date(req.query.date_to as string)
        : undefined,
    };

    const incidents = await incidentService.getIncidents(filters);

    const result: ITable<any> = {
      dataSource: incidents,
      columns: [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: 'Дата создания',
          dataIndex: 'createdAt',
          key: 'createdAt',
        },
        {
          title: 'Направление',
          dataIndex: 'direction',
          key: 'direction',
        },
        {
          title: 'Департамент',
          dataIndex: 'department',
          key: 'department',
        },
        {
          title: 'Инциденты',
          dataIndex: 'incidents',
          key: 'incidents',
        },
        {
          title: 'Объект',
          dataIndex: 'object',
          key: 'object',
        },
      ],
    };

    res.success(result, 'Incidents retrieved successfully');
  }),

  getIncident: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const incident = await incidentService.getIncident(Number(id));

    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }

    res.success(incident, 'Incident retrieved successfully');
  }),

  createIncident: asyncErrorHandler(
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
            status: IncidentStatusEnum.DRAFT,
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
        return await incidentService.getIncident(incident.id);
      });

      res.created(result, 'Incident created successfully');
    }
  ),

  updateIncident: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const incident = await incidentService.updateIncident(
        Number(id),
        req.body
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      res.success(incident, 'Incident updated successfully');
    }
  ),

  deleteIncident: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await incidentService.deleteIncident(Number(id));

      if (!result) {
        throw ApiError.notFound('Incident not found');
      }

      res.noContent();
    }
  ),
};
