import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { explanatoryNoteRegisterService } from '../../services/explanatoryNoteRegister.service';
import { paginatedResultToTable } from '../../utils/pagination';

export const getExplanatoryNotes = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const page = Number(req.query.page) || 1;
    const requestedLimit = Number(req.query.limit) || 10;
    const REGISTER_MAX_LIMIT = 20000;
    const limit = Math.min(requestedLimit, REGISTER_MAX_LIMIT);

    const filters =
      req.query.department_id ||
      req.query.period_from ||
      req.query.period_to ||
      req.query.kc_r ||
      req.query.p ||
      req.query.type ||
      req.query.incident_type
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
            kc_r: Array.isArray(req.query.kc_r) ? req.query.kc_r as string[] : req.query.kc_r ? [req.query.kc_r as string] : undefined,
            p: Array.isArray(req.query.p) ? req.query.p as string[] : req.query.p ? [req.query.p as string] : undefined,
            type: Array.isArray(req.query.type) ? req.query.type as ('incident' | 'event' | 'additionally')[] : req.query.type ? [req.query.type as 'incident' | 'event' | 'additionally'] : undefined,
            incident_type: Array.isArray(req.query.incident_type) ? req.query.incident_type as string[] : req.query.incident_type ? [req.query.incident_type as string] : undefined,
          }
        : undefined;

    const result = await explanatoryNoteRegisterService.getRegister({
      filters,
      pagination: { page, limit },
    });

    const columns = [
      { title: '№', dataIndex: 'number', key: 'number' },
      { title: 'ID', dataIndex: 'display_id', key: 'display_id' },
      { title: 'КЦ/Р', dataIndex: 'kc_r', key: 'kc_r' },
      { title: 'Р', dataIndex: 'p', key: 'p' },
      { title: 'Период', key: 'period', dataIndex: 'period' },
      { title: 'Дата', dataIndex: 'entry_date', key: 'entry_date' },
      { title: 'Тип', dataIndex: 'typeLabel', key: 'type' },
      { title: 'Тип инцидента', dataIndex: 'incident_type', key: 'incident_type' },
      { title: 'Информация о событии', dataIndex: 'event_info', key: 'event_info' },
      { title: 'Кол-во СР', dataIndex: 'service_investigation_count', key: 'service_investigation_count' },
      { title: 'Кол-во СП', dataIndex: 'service_check_count', key: 'service_check_count' },
      { title: 'Кол-во СП ИБ', dataIndex: 'service_check_ib_count', key: 'service_check_ib_count' },
      { title: 'Кол-во ПМ', dataIndex: 'verification_activity_count', key: 'verification_activity_count' },
      { title: 'Кол-во наказано', dataIndex: 'punished_count', key: 'punished_count' },
      { title: 'Кол-во уволено', dataIndex: 'dismissed_count', key: 'dismissed_count' },
      { title: 'Кол-во передано материалов', dataIndex: 'materials_transferred_count', key: 'materials_transferred_count' },
      { title: 'Кол-во возбуждено УД/АД', dataIndex: 'cases_initiated_count', key: 'cases_initiated_count' },
      { title: 'Выявлен ущерб, руб.', dataIndex: 'detected_damage', key: 'detected_damage' },
      { title: 'Возмещен ущерб, руб.', dataIndex: 'recovered_damage', key: 'recovered_damage' },
      { title: 'Возмещена ДЗ, руб.', dataIndex: 'recovered_receivables', key: 'recovered_receivables' },
      { title: 'Предотвращен ущерб, руб.', dataIndex: 'prevented_damage', key: 'prevented_damage' },
      { title: 'Снижена стоимость закупки, договора, доп.согл., руб.', dataIndex: 'reduced_cost', key: 'reduced_cost' },
      { title: 'Предотвращено необ. списание ДЗ, руб.', dataIndex: 'prevented_writeoff_receivables', key: 'prevented_writeoff_receivables' },
      { title: 'Получен доп. доход, руб.', dataIndex: 'additional_income', key: 'additional_income' },
      { title: 'Принят к вычету НДС, руб.', dataIndex: 'vat_deducted', key: 'vat_deducted' },
    ];

    const tableResult = paginatedResultToTable(
      {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      columns
    );

    res.success(
      { ...tableResult, totals: result.totals, filterOptions: result.filterOptions },
      'Explanatory notes register retrieved successfully'
    );
  }
);
