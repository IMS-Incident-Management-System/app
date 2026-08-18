import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
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

export const getEvents = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const departmentIds = parseNumberList(req.query.department_id);
    const hasFilters =
      departmentIds ||
      req.query.date_from ||
      req.query.date_to ||
      req.query.code ||
      req.query.is_db !== undefined;

    const filters = hasFilters
      ? {
          department_id: departmentIds,
          date_from: req.query.date_from
            ? new Date(req.query.date_from as string)
            : undefined,
          date_to: req.query.date_to
            ? new Date(req.query.date_to as string)
            : undefined,
          code: req.query.code
            ? String(req.query.code)
            : undefined,
          is_db:
            req.query.is_db !== undefined
              ? String(req.query.is_db) === 'true'
              : undefined,
        }
      : undefined;

    const { events, total } = await eventService.getEvents({
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
        title: 'Дата события',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Подразделение',
        dataIndex: 'department',
        key: 'department',
      },
      {
        title: 'Действия',
        key: 'actions',
        dataIndex: 'actions',
      },
    ];

    const result = paginatedResultToTable(
      {
        items: events,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      columns
    );

    res.success(result, 'Events retrieved successfully');
  }
);

