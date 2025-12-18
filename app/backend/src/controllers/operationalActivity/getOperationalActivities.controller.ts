import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { OperationalActivityDirectionEnum } from '../../enums/operationalActivity';
import { operationalActivityService } from '../../services/operationalActivity.service';
import { paginatedResultToTable } from '../../utils/pagination';

export const getOperationalActivities = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters =
      req.query.department_id ||
      req.query.direction ||
      req.query.period_from ||
      req.query.period_to ||
      req.query.created_by
        ? {
            department_id: req.query.department_id
              ? Number(req.query.department_id)
              : undefined,
            direction: req.query.direction as OperationalActivityDirectionEnum,
            period_from: req.query.period_from
              ? new Date(req.query.period_from as string)
              : undefined,
            period_to: req.query.period_to
              ? new Date(req.query.period_to as string)
              : undefined,
            created_by: req.query.created_by as string,
          }
        : undefined;

    const { operationalActivities, total } = await operationalActivityService.getOperationalActivities({
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
        title: 'Период',
        dataIndex: 'period_date',
        key: 'period_date',
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
        title: 'Создал',
        dataIndex: 'created_by',
        key: 'created_by',
      },
    ];

    const result = paginatedResultToTable(
      {
        items: operationalActivities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      columns
    );

    res.success(result, 'Operational activities retrieved successfully');
  }
);


