import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { explanatoryNoteService } from '../../services/explanatoryNote.service';
import { paginatedResultToTable } from '../../utils/pagination';

export const getExplanatoryNotes = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters =
      req.query.department_id ||
      req.query.period_from ||
      req.query.period_to ||
      req.query.entry_date_from ||
      req.query.entry_date_to
        ? {
            department_id: req.query.department_id
              ? Number(req.query.department_id)
              : undefined,
            period_from: req.query.period_from
              ? new Date(req.query.period_from as string)
              : undefined,
            period_to: req.query.period_to
              ? new Date(req.query.period_to as string)
              : undefined,
            entry_date_from: req.query.entry_date_from
              ? new Date(req.query.entry_date_from as string)
              : undefined,
            entry_date_to: req.query.entry_date_to
              ? new Date(req.query.entry_date_to as string)
              : undefined,
          }
        : undefined;

    const { explanatoryNotes, total } = await explanatoryNoteService.getExplanatoryNotes({
      filters,
      pagination: { page, limit },
    });

    const columns = [
      {
        title: '№',
        dataIndex: 'number',
        key: 'number',
      },
      {
        title: 'КЦ/Р',
        dataIndex: 'kc_r',
        key: 'kc_r',
      },
      {
        title: 'P',
        dataIndex: 'p',
        key: 'p',
      },
      {
        title: 'Период',
        dataIndex: 'period',
        key: 'period',
      },
      {
        title: 'Дата',
        dataIndex: 'entry_date',
        key: 'entry_date',
      },
      {
        title: 'Информация о событии',
        dataIndex: 'event_info',
        key: 'event_info',
      },
      {
        title: 'Кол-во СП СР',
        dataIndex: 'service_investigation_count',
        key: 'service_investigation_count',
      },
      {
        title: 'Кол-во СП ИБ',
        dataIndex: 'service_check_ib_count',
        key: 'service_check_ib_count',
      },
      {
        title: 'Кол-во ПМ',
        dataIndex: 'verification_activity_count',
        key: 'verification_activity_count',
      },
      {
        title: 'Кол-во наказано',
        dataIndex: 'punished_count',
        key: 'punished_count',
      },
      {
        title: 'Кол-во уволено',
        dataIndex: 'dismissed_count',
        key: 'dismissed_count',
      },
      {
        title: 'Кол-во передано материалов',
        dataIndex: 'materials_transferred_count',
        key: 'materials_transferred_count',
      },
      {
        title: 'Кол-во возбуждено УД/АД',
        dataIndex: 'cases_initiated_count',
        key: 'cases_initiated_count',
      },
      {
        title: 'Выявлен ущерб, руб.',
        dataIndex: 'detected_damage',
        key: 'detected_damage',
      },
      {
        title: 'Возмещен ущерб, руб.',
        dataIndex: 'recovered_damage',
        key: 'recovered_damage',
      },
      {
        title: 'Возмещена ДЗ, руб.',
        dataIndex: 'recovered_receivables',
        key: 'recovered_receivables',
      },
      {
        title: 'Предотвращен ущерб, руб.',
        dataIndex: 'prevented_damage',
        key: 'prevented_damage',
      },
      {
        title: 'Снижена стоимость закупки, договора, доп.согл., руб.',
        dataIndex: 'reduced_cost',
        key: 'reduced_cost',
      },
      {
        title: 'Предотвращен о необ. списание ДЗ, руб.',
        dataIndex: 'prevented_writeoff_receivables',
        key: 'prevented_writeoff_receivables',
      },
      {
        title: 'Получен доп. доход, руб.',
        dataIndex: 'additional_income',
        key: 'additional_income',
      },
      {
        title: 'Принят к вычету НДС, руб.',
        dataIndex: 'vat_deducted',
        key: 'vat_deducted',
      },
      {
        title: 'Действия',
        key: 'actions',
        dataIndex: 'actions',
      },
    ];

    const result = paginatedResultToTable(
      {
        items: explanatoryNotes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      columns
    );

    res.success(result, 'Explanatory notes retrieved successfully');
  }
);
