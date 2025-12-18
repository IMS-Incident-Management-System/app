import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
import { paginatedResultToTable } from '../../utils/pagination';

export const getEvents = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters =
      req.query.department_id ||
      req.query.date_from ||
      req.query.date_to
        ? {
            department_id: req.query.department_id
              ? Number(req.query.department_id)
              : undefined,
            date_from: req.query.date_from
              ? new Date(req.query.date_from as string)
              : undefined,
            date_to: req.query.date_to
              ? new Date(req.query.date_to as string)
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
        dataIndex: 'id',
        key: 'id',
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

