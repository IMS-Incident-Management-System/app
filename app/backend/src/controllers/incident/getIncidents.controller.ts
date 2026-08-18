import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { SecurityDirectionEnum } from '../../models/incident';
import { incidentService } from '../../services/incident.service';
import { paginatedResultToTable } from '../../utils/pagination';

function parseQueryList(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberList(value: unknown): number[] | undefined {
  const numbers = parseQueryList(value)
    .map(Number)
    .filter((item) => Number.isFinite(item));
  return numbers.length ? numbers : undefined;
}

function parseDirectionList(value: unknown): SecurityDirectionEnum[] | undefined {
  const directions = parseQueryList(value) as SecurityDirectionEnum[];
  return directions.length ? directions : undefined;
}

export const getIncidents = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const departmentIds = parseNumberList(req.query.department_id);
    const directions = parseDirectionList(req.query.direction);
    const objectTypeIds = parseNumberList(req.query.object_type_id);
    const eventTypeIds = parseNumberList(req.query.event_type_id);
    const hasFilters =
      departmentIds ||
      directions ||
      objectTypeIds ||
      eventTypeIds ||
      req.query.date_from ||
      req.query.date_to ||
      req.query.code ||
      req.query.is_db !== undefined ||
      req.query.is_sent_1db !== undefined;

    const filters = hasFilters
      ? {
          department_id: departmentIds,
          direction: directions,
          object_type_id: objectTypeIds,
          event_type_id: eventTypeIds,
          date_from: req.query.date_from
            ? new Date(req.query.date_from as string)
            : undefined,
          date_to: req.query.date_to
            ? new Date(req.query.date_to as string)
            : undefined,
          code: req.query.code ? String(req.query.code) : undefined,
          is_db:
            req.query.is_db !== undefined
              ? String(req.query.is_db) === 'true'
              : undefined,
          is_sent_1db:
            req.query.is_sent_1db !== undefined
              ? String(req.query.is_sent_1db) === 'true'
              : undefined,
        }
      : undefined;

    const { incidents, total } = await incidentService.getIncidents({
      filters,
      pagination: { page, limit },
    });

    const columns = [
      {
        title: 'ID',
        dataIndex: 'code',
        key: 'code',
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
        title: 'Подразделение',
        dataIndex: 'department',
        key: 'department',
      },
      {
        title: 'Инциденты',
        dataIndex: 'incidents',
        key: 'incidents',
      },
      {
        title: 'Тип объекта',
        dataIndex: 'object_type',
        key: 'object_type',
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
