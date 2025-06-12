import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import {
  IncidentStatusEnum,
  SecurityDirectionEnum,
} from '../../models/incident';
import { incidentService } from '../../services/incident.service';
import { paginatedResultToTable } from '../../utils/pagination';

export const getIncidents = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters =
      req.query.department_id ||
      req.query.direction ||
      req.query.status ||
      req.query.date_from ||
      req.query.date_to
        ? {
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
          }
        : undefined;

    console.log(filters);

    const { incidents, total } = await incidentService.getIncidents({
      filters,
      pagination: { page, limit },
    });

    const columns = [
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
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
      },
    ];

    const result = paginatedResultToTable(
      {
        items: incidents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      columns
    );

    res.success(result, 'Incidents retrieved successfully');
  }
);
