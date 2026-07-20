import { Request } from 'express';
import { asyncErrorHandler } from '../middlewares/errorHandler.middleware';
import { CustomResponse } from '../middlewares/responseHandler.middleware';
import { reportService } from '../services/report.service';
import { REPORT_FIELDS } from '../constants/reportFields';
import { reportImportService } from '../services/reportImport.service';
import { MulterRequest } from '../types/multer';
import { REPORT_TYPE_RP053_MATRIX } from '../models/reportImportBatch';
import fs from 'fs';

// Хранилище активных запросов для отмены предыдущих при поступлении новых
interface ActiveRequest {
  abortController: AbortController;
  key: string;
  timestamp: number;
}

// Храним все активные запросы в одном массиве для глобальной отмены
const allActiveRequests: ActiveRequest[] = [];

// Генерируем ключ для запроса на основе параметров
function getRequestKey(dateFrom: string, dateTo: string, departmentIds: number[], page: number, limit: number): string {
  const deptIdsStr = departmentIds.sort((a, b) => a - b).join(',');
  return `${dateFrom}_${dateTo}_${deptIdsStr}_${page}_${limit}`;
}

// Отменяем ВСЕ предыдущие активные запросы при новом запросе
function cancelAllPreviousRequests(): void {
  if (allActiveRequests.length > 0) {
    console.log(`[getReportTable] Cancelling ${allActiveRequests.length} previous active request(s) before starting new one`);
    allActiveRequests.forEach((req, index) => {
      console.log(`[getReportTable] Aborting request ${index + 1}/${allActiveRequests.length} (age: ${Date.now() - req.timestamp}ms)`);
      req.abortController.abort();
    });
    allActiveRequests.length = 0; // Очищаем массив
  } else {
    console.log('[getReportTable] No previous requests to cancel');
  }
}

export const reportController = {
  /**
   * Генерация Excel отчета
   */
  generateReport: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { dateFrom, dateTo, departmentIds, fields } = req.body;

    if (!dateFrom || !dateTo || !departmentIds || !Array.isArray(departmentIds) || !fields || !Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать dateFrom, dateTo, departmentIds (массив) и fields (массив)'
      });
    }

    const buffer = await reportService.generateReport({
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      departmentIds: departmentIds.map((id: any) => Number(id)),
      fields: fields
    });

    // Устанавливаем заголовки для скачивания файла
    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const fromMonth = monthNames[fromDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toMonth = monthNames[toDate.getMonth()];
    const toYear = toDate.getFullYear();

    const fileName = fromMonth === toMonth && fromYear === toYear
      ? `Отчет_${fromMonth}_${fromYear}.xlsx`
      : `Отчет_${fromMonth}_${fromYear}_${toMonth}_${toYear}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  }),

  /**
   * Получение списка доступных полей для отчёта (160 правил РП-053).
   * key — идентификатор для API (r1..r160), label — название показателя.
   */
  getAvailableFields: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const fields = REPORT_FIELDS.map((def) => ({
      key: def.key,
      metricKey: def.metricKey,
      label: def.label,
    }));
    res.success(fields, 'Available fields retrieved successfully');
  }),

  /** @deprecated Используется getAvailableFields из REPORT_FIELDS; оставлен старый список для совместимости при необходимости */
  getAvailableFieldsLegacy: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const fields = [
      // ========== ИНЦИДЕНТЫ (Incident) ==========
      { entity: 'incident', field: 'is_db', label: 'Особо важно (1ДБ) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.0', subgroupName: 'Инциденты' },
      { entity: 'incident', field: 'detected_damage', label: 'Выявлен ущерб (руб.) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.4', subgroupName: 'Выявлен ущерб (руб.)' },
      { entity: 'incident', field: 'recovered_damage', label: 'Возмещен ущерб (руб.) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.5', subgroupName: 'Возмещен ущерб (руб.)' },
      { entity: 'incident', field: 'prevented_damage', label: 'Предотвращен ущерб (руб.) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.6', subgroupName: 'Предотвращен ущерб (руб.)' },
      { entity: 'incident', field: 'additional_income', label: 'Получен дополнительный доход (руб.) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.7', subgroupName: 'Получен дополнительный доход (руб.)' },
      { entity: 'incident', field: 'reduced_cost', label: 'Снижена стоимость товаров, работ и услуг на сумму (руб.) - инциденты', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.8', subgroupName: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)' },

      // ========== СОБЫТИЯ (Event) ==========
      { entity: 'event', field: 'is_service_investigation', label: 'Проведено служебных расследований (СР)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.1' },
      { entity: 'event', field: 'is_service_investigation_ib', label: 'Проведено служебных расследований по ИБ (СР ИБ)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.2' },
      { entity: 'event', field: 'is_service_investigation_bpio', label: 'Проведено служебных расследований БПиО (СР БПиО)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.3' },
      { entity: 'event', field: 'is_service_investigation_bpio_hotline', label: 'Проведено служебных расследований БПиО (горячая линия)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.4' },
      { entity: 'event', field: 'is_service_check', label: 'Проведено служебных проверок (СП)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.5' },
      { entity: 'event', field: 'is_service_check_ib', label: 'Проведено служебных проверок по ИБ (СП ИБ)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.6' },
      { entity: 'event', field: 'is_service_check_bpio', label: 'Проведено служебных проверок БПиО (СП БПиО)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.7' },
      { entity: 'event', field: 'is_service_check_bpio_hotline', label: 'Проведено служебных проверок БПиО (горячая линия)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.1', subgroupName: 'Проведено служебных проверок и расследований', subsubgroup: '1.1.8' },
      { entity: 'event', field: 'is_verification_activity', label: 'Проведено проверочных мероприятий (ПМ)', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.3', subgroupName: 'Проведено проверочных мероприятий (ПМ) в рамках' },
      { entity: 'event', field: 'is_db', label: 'Особо важно (1ДБ) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.0', subgroupName: 'События' },
      { entity: 'event', field: 'detected_damage', label: 'Выявлен ущерб (руб.) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.4', subgroupName: 'Выявлен ущерб (руб.)' },
      { entity: 'event', field: 'recovered_damage', label: 'Возмещен ущерб (руб.) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.5', subgroupName: 'Возмещен ущерб (руб.)' },
      { entity: 'event', field: 'prevented_damage', label: 'Предотвращен ущерб (руб.) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.6', subgroupName: 'Предотвращен ущерб (руб.)' },
      { entity: 'event', field: 'additional_income', label: 'Получен дополнительный доход (руб.) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.7', subgroupName: 'Получен дополнительный доход (руб.)' },
      { entity: 'event', field: 'reduced_cost', label: 'Снижена стоимость товаров, работ и услуг на сумму (руб.) - события', group: '1', groupName: 'Проведение мероприятий, проверок и расследований', subgroup: '1.8', subgroupName: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)' },
      { entity: 'event', field: 'prevented_unnecessary_writeoff', label: 'Предотвращено необ. списание ДЗ, руб.', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.7', subgroupName: 'Предотвращено фактов необоснованного списания' },
      { entity: 'event', field: 'vat_deducted', label: 'Принят к вычету НДС, руб.', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.4', subgroupName: 'Общая сумма доступного к возмещению, но не возмещенного НДС' },

      // ========== ОПЕРАЦИОННАЯ ДЕЯТЕЛЬНОСТЬ (OperationalActivity) ==========
      
      // ЭБ - Работа по возмещению ДЗ и НДС (DEBT_RECOVERY)
      { entity: 'operationalActivity', field: 'total_debt', label: 'Общий размер дебиторской задолженности (руб.)', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.1', subgroupName: 'Общий размер дебиторской задолженности (руб.)' },
      { entity: 'operationalActivity', field: 'overdue_debt', label: 'Общий размер просроченной дебиторской задолженности', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.2', subgroupName: 'Общий размер просроченной дебиторской задолженности' },
      { entity: 'operationalActivity', field: 'overdue_debt_sb', label: 'в том числе размер ПДЗ, переданный в работу', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.2', subgroupName: 'Общий размер просроченной дебиторской задолженности', subsubgroup: '2.2.1' },
      { entity: 'operationalActivity', field: 'recovered_debt', label: 'Взыскано ДЗ при участии подразделений', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.3', subgroupName: 'Взыскано ДЗ при участии подразделений' },
      { entity: 'operationalActivity', field: 'available_vat', label: 'Общая сумма доступного к возмещению, но не возмещенного НДС', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.4', subgroupName: 'Общая сумма доступного к возмещению, но не возмещенного НДС' },
      { entity: 'operationalActivity', field: 'vat_assistance', label: 'Содействие в получении документов для возмещения НДС', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.5', subgroupName: 'Содействие в получении документов для возмещения НДС' },
      { entity: 'operationalActivity', field: 'written_off_debt', label: 'Общий размер списанной дебиторской задолженности', group: '2', groupName: 'Работа по возмещению ДЗ и НДС', subgroup: '2.6', subgroupName: 'Общий размер списанной дебиторской задолженности' },

      // ЭБ - Взаимодействие с правоохранительными органами (LAW_ENFORCEMENT)
      { entity: 'operationalActivity', field: 'incoming_requests', label: 'Поступило входящих запросов', group: '2', groupName: 'Взаимодействие с правоохранительными органами', subgroup: '2.8', subgroupName: 'Взаимодействие с правоохранительными органами' },
      { entity: 'operationalActivity', field: 'executed_requests', label: 'Исполнено запросов', group: '2', groupName: 'Взаимодействие с правоохранительными органами', subgroup: '2.8', subgroupName: 'Взаимодействие с правоохранительными органами' },
      { entity: 'operationalActivity', field: 'executed_tasks', label: 'Исполнено заданий', group: '2', groupName: 'Взаимодействие с правоохранительными органами', subgroup: '2.8', subgroupName: 'Взаимодействие с правоохранительными органами' },
      { entity: 'operationalActivity', field: 'received_presentations', label: 'Поступило представлений', group: '2', groupName: 'Взаимодействие с правоохранительными органами', subgroup: '2.8', subgroupName: 'Взаимодействие с правоохранительными органами' },
      { entity: 'operationalActivity', field: 'executed_presentations', label: 'Исполнено представлений', group: '2', groupName: 'Взаимодействие с правоохранительными органами', subgroup: '2.8', subgroupName: 'Взаимодействие с правоохранительными органами' },

      // ЭБ - Контроль инвестиционной, закупочной и договорной деятельности (INVESTMENT_CONTROL)
      { entity: 'operationalActivity', field: 'checked_entities_new', label: 'Проверено юр. и физ.лиц перед заключением новых договоров', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.1', subgroupName: 'Проверено юр. и физ.лиц перед заключением новых договоров' },
      { entity: 'operationalActivity', field: 'negative_conclusions_new', label: 'из них дано отрицательных заключений по новым договорам', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.1', subgroupName: 'Проверено юр. и физ.лиц перед заключением новых договоров', subsubgroup: '3.1.1' },
      { entity: 'operationalActivity', field: 'checked_entities_active', label: 'Проверено контрагентов с действующими договорами', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.2', subgroupName: 'Проверено контрагентов с действующими договорами' },
      { entity: 'operationalActivity', field: 'negative_conclusions_active', label: 'из них дано отрицательных заключений по действующим договорам', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.2', subgroupName: 'Проверено контрагентов с действующими договорами', subsubgroup: '3.2.1' },
      { entity: 'operationalActivity', field: 'checked_draft_contracts', label: 'Проверено проектов договоров, доп. соглашений', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.3', subgroupName: 'Проверено проектов договоров, доп. соглашений' },
      { entity: 'operationalActivity', field: 'not_approved_drafts', label: 'из них не согласовано', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.3', subgroupName: 'Проверено проектов договоров, доп. соглашений', subsubgroup: '3.3.1' },
      { entity: 'operationalActivity', field: 'checked_active_contracts', label: 'Проверено действующих договоров, доп. соглашений', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.4', subgroupName: 'Проверено действующих договоров, доп. соглашений' },
      { entity: 'operationalActivity', field: 'not_approved_active', label: 'из них не согласовано (действующие договоры)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.4', subgroupName: 'Проверено действующих договоров, доп. соглашений', subsubgroup: '3.4.1' },
      { entity: 'operationalActivity', field: 'planned_budget', label: 'Сумма запланированного бюджета закупок (руб.)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.5', subgroupName: 'Бюджет и закупки' },
      { entity: 'operationalActivity', field: 'procurement_procedures_count', label: 'Проведено закупочных процедур (кол-во)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.5', subgroupName: 'Бюджет и закупки' },
      { entity: 'operationalActivity', field: 'single_source_count', label: 'использован способ "единственный источник" (кол-во)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.5', subgroupName: 'Бюджет и закупки' },
      { entity: 'operationalActivity', field: 'procurement_procedures_sum', label: 'Проведено закупочных процедур на сумму (руб.)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.5', subgroupName: 'Бюджет и закупки' },
      { entity: 'operationalActivity', field: 'single_source_sum', label: 'использован способ "единственный источник" на сумму (руб.)', group: '3', groupName: 'Контроль инвестиционной, закупочной и договорной деятельности', subgroup: '3.5', subgroupName: 'Бюджет и закупки' },

      // ЭБ - Работа по выявлению признаков аффилированности (AFFILIATION)
      { entity: 'operationalActivity', field: 'checked_employees', label: 'Проверено сотрудников', group: '4', groupName: 'Работа по выявлению признаков аффилированности', subgroup: '4.1', subgroupName: 'Проверка сотрудников и кандидатов' },
      { entity: 'operationalActivity', field: 'found_affiliated', label: 'Выявлено аффилированных', group: '4', groupName: 'Работа по выявлению признаков аффилированности', subgroup: '4.1', subgroupName: 'Проверка сотрудников и кандидатов' },
      { entity: 'operationalActivity', field: 'checked_candidates', label: 'Проверено кандидатов на трудоустройство', group: '4', groupName: 'Работа по выявлению признаков аффилированности', subgroup: '4.1', subgroupName: 'Проверка сотрудников и кандидатов' },
      { entity: 'operationalActivity', field: 'rejected_candidates', label: 'Отклонено кандидатов', group: '4', groupName: 'Работа по выявлению признаков аффилированности', subgroup: '4.1', subgroupName: 'Проверка сотрудников и кандидатов' },
      { entity: 'operationalActivity', field: 'rejected_affiliated', label: 'Отклонено аффилированных', group: '4', groupName: 'Работа по выявлению признаков аффилированности', subgroup: '4.1', subgroupName: 'Проверка сотрудников и кандидатов' },

      // ЭБ - Работа с обращениями граждан (CITIZEN_APPEALS)
      { entity: 'operationalActivity', field: 'total_appeals', label: 'Проверено обращений граждан и юр. лиц', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'zon_applications', label: 'Заявлений абонентов о непричастности к договору', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'fictitious_contracts', label: 'Выявлено фиктивных договоров', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'termination_requests', label: 'Заявлений о расторжении договора и возврате ДС', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'beautiful_numbers', label: 'Запросов на переоформление "красивых" номеров', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'sim_replacement', label: 'Заявлений о неправомерной замене SIM-карт', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'refund_requests', label: 'Заявлений о возврате ошибочного платежа', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },
      { entity: 'operationalActivity', field: 'other_appeals', label: 'Прочих заявлений абонентов', group: '5', groupName: 'Работа с обращениями граждан', subgroup: '5.1', subgroupName: 'Обращения граждан' },

      // ИБ - Сведения об участии в проверочных мероприятиях (INSPECTIONS)
      { entity: 'operationalActivity', field: 'ib_incident_checks', label: 'проверок по инцидентам ИБ', group: '6', groupName: 'ИБ - Сведения об участии в проверочных мероприятиях', subgroup: '6.1', subgroupName: 'Проверки ИБ' },
      { entity: 'operationalActivity', field: 'planned_ib_checks', label: 'плановых проверок ИБ', group: '6', groupName: 'ИБ - Сведения об участии в проверочных мероприятиях', subgroup: '6.1', subgroupName: 'Проверки ИБ' },
      { entity: 'operationalActivity', field: 'non_compliances', label: 'несоответствий нормативным документам', group: '6', groupName: 'ИБ - Сведения об участии в проверочных мероприятиях', subgroup: '6.1', subgroupName: 'Проверки ИБ' },

      // ИБ - Меры, принятые к нарушителям (VIOLATORS_MEASURES)
      { entity: 'operationalActivity', field: 'warnings', label: 'Вынесено предупреждений', group: '6', groupName: 'ИБ - Меры, принятые к нарушителям', subgroup: '6.2', subgroupName: 'Меры к нарушителям' },
      { entity: 'operationalActivity', field: 'remarks', label: 'Вынесено замечаний', group: '6', groupName: 'ИБ - Меры, принятые к нарушителям', subgroup: '6.2', subgroupName: 'Меры к нарушителям' },
      { entity: 'operationalActivity', field: 'reprimands', label: 'Вынесено выговоров', group: '6', groupName: 'ИБ - Меры, принятые к нарушителям', subgroup: '6.2', subgroupName: 'Меры к нарушителям' },
      { entity: 'operationalActivity', field: 'dismissals', label: 'Уволено сотрудников', group: '6', groupName: 'ИБ - Меры, принятые к нарушителям', subgroup: '6.2', subgroupName: 'Меры к нарушителям' },

      // ИБ - Количество согласованных доступов (ACCESS_APPROVALS)
      { entity: 'operationalActivity', field: 'approved_accesses', label: 'Согласовано доступов', group: '6', groupName: 'ИБ - Количество согласованных доступов', subgroup: '6.3', subgroupName: 'Согласование доступов' },

      // ИБ - Подготовлено служебных записок (MEMOS_PREPARED)
      { entity: 'operationalActivity', field: 'memos_count', label: 'Подготовлено служебных записок', group: '6', groupName: 'ИБ - Подготовлено служебных записок', subgroup: '6.4', subgroupName: 'Служебные записки' },

      // ИБ - События и мероприятия (RISK_MINIMIZATION)
      { entity: 'operationalActivity', field: 'scanned_count', label: 'Проведено/просканировано', group: '6', groupName: 'ИБ - События и мероприятия', subgroup: '6.5', subgroupName: 'События и мероприятия' },
      { entity: 'operationalActivity', field: 'vulnerabilities_found', label: 'Выявлено уязвимостей', group: '6', groupName: 'ИБ - События и мероприятия', subgroup: '6.5', subgroupName: 'События и мероприятия' },

      // ИБ - Реализация режима защиты КТ и КИ (CT_KI_PROTECTION)
      { entity: 'operationalActivity', field: 'confidential_docs', label: 'Зарегистрировано конфиденциальных документов', group: '6', groupName: 'ИБ - Реализация режима защиты КТ и КИ', subgroup: '6.6', subgroupName: 'Защита КТ и КИ' },
      { entity: 'operationalActivity', field: 'compliance_checks', label: 'Проведено проверок на соответствие нормативным документам', group: '6', groupName: 'ИБ - Реализация режима защиты КТ и КИ', subgroup: '6.6', subgroupName: 'Защита КТ и КИ' },

      // ИБ - Контроль доступа к ИС (ACCESS_CONTROL)
      { entity: 'operationalActivity', field: 'access_requests', label: 'Рассмотрено заявок на предоставление доступа', group: '6', groupName: 'ИБ - Контроль доступа к ИС', subgroup: '6.7', subgroupName: 'Контроль доступа' },
      { entity: 'operationalActivity', field: 'access_violations', label: 'Зафиксировано нарушений', group: '6', groupName: 'ИБ - Контроль доступа к ИС', subgroup: '6.7', subgroupName: 'Контроль доступа' },
      { entity: 'operationalActivity', field: 'account_audits', label: 'Проведено аудитов учетных записей', group: '6', groupName: 'ИБ - Контроль доступа к ИС', subgroup: '6.7', subgroupName: 'Контроль доступа' },
      { entity: 'operationalActivity', field: 'violations_found', label: 'Выявлено нарушений', group: '6', groupName: 'ИБ - Контроль доступа к ИС', subgroup: '6.7', subgroupName: 'Контроль доступа' },

      // ИБ - Мониторинг инцидентов ИБ (INCIDENT_MONITORING)
      { entity: 'operationalActivity', field: 'processed_incidents', label: 'Обработано инцидентов ИБ', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'admin_rights_incidents', label: 'Инцидентов с правами администратора', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'kspd_access_incidents', label: 'Инцидентов с доступом к КСПД', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'spam_incidents', label: 'Спам-инцидентов', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'virus_incidents', label: 'Вирусных инцидентов', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'software_incidents', label: 'Инцидентов с ПО', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'ki_pdn_incidents', label: 'Инцидентов с КИ/ПДн', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'network_attacks_incidents', label: 'Сетевых атак', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'leaks_found', label: 'Выявлено утечек', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'blocked_threats', label: 'Заблокировано угроз', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },
      { entity: 'operationalActivity', field: 'other_incidents', label: 'Прочих инцидентов', group: '6', groupName: 'ИБ - Мониторинг инцидентов ИБ', subgroup: '6.8', subgroupName: 'Мониторинг инцидентов' },

      // ИБ - Противодействие фроду (FRAUD_PREVENTION)
      { entity: 'operationalActivity', field: 'fraud_incidents', label: 'Инцидентов фрода', group: '6', groupName: 'ИБ - Противодействие фроду', subgroup: '6.9', subgroupName: 'Противодействие фроду' },

      // ИБ - Анализ изменений (INFRASTRUCTURE_ANALYSIS)
      { entity: 'operationalActivity', field: 'analyzed_documents', label: 'Проанализировано документов', group: '6', groupName: 'ИБ - Анализ изменений', subgroup: '6.10', subgroupName: 'Анализ изменений' },

      // БПиО - Штатное количество сотрудников (STAFF_COUNT)
      { entity: 'operationalActivity', field: 'staff_count', label: 'Штатное количество сотрудников', group: '7', groupName: 'БПиО - Штатное количество сотрудников', subgroup: '7.1', subgroupName: 'Штат' },

      // БПиО - Количество объектов (OBJECTS_COUNT)
      { entity: 'operationalActivity', field: 'objects_count', label: 'Количество объектов', group: '7', groupName: 'БПиО - Количество объектов', subgroup: '7.1', subgroupName: 'Количество объектов' },
      { entity: 'operationalActivity', field: 'objects_physical_security', label: 'Объектов под физической охраной', group: '7', groupName: 'БПиО - Количество объектов', subgroup: '7.2', subgroupName: 'Объекты' },
      { entity: 'operationalActivity', field: 'objects_panel_security', label: 'Объектов под пультовой охраной', group: '7', groupName: 'БПиО - Количество объектов', subgroup: '7.2', subgroupName: 'Объекты' },
      { entity: 'operationalActivity', field: 'categorized_rooms_count', label: 'Количество категорированных помещений', group: '7', groupName: 'БПиО - Количество объектов', subgroup: '7.2', subgroupName: 'Объекты' },

      // БПиО - Бюджет на усиление АТЗ (CAPEX_BUDGET)
      { entity: 'operationalActivity', field: 'capex_allocated', label: 'Сумма выделенного бюджета на год (руб.)', group: '7', groupName: 'БПиО - Бюджет на усиление АТЗ', subgroup: '7.3', subgroupName: 'Бюджет АТЗ' },
      { entity: 'operationalActivity', field: 'capex_spent_current', label: 'Сумма освоения бюджета в текущем месяце (руб.)', group: '7', groupName: 'БПиО - Бюджет на усиление АТЗ', subgroup: '7.3', subgroupName: 'Бюджет АТЗ' },

      // БПиО - Бюджет на физ. охрану (OPEX_BUDGET)
      { entity: 'operationalActivity', field: 'opex_allocated', label: 'Сумма выделенного бюджета (руб.)', group: '7', groupName: 'БПиО - Бюджет на физ. охрану', subgroup: '7.4', subgroupName: 'Бюджет охраны' },

      // БПиО - Проверки состояния АТЗ (ATZ_INSPECTIONS)
      { entity: 'operationalActivity', field: 'atz_checks_pb', label: 'Проверок сотрудниками ПБ ДЗК/ДЗО', group: '7', groupName: 'БПиО - Проверки состояния АТЗ', subgroup: '7.5', subgroupName: 'Проверки АТЗ' },
      { entity: 'operationalActivity', field: 'atz_checks_law', label: 'Проверок совместно с ПОО', group: '7', groupName: 'БПиО - Проверки состояния АТЗ', subgroup: '7.5', subgroupName: 'Проверки АТЗ' },

      // БПиО - АТУ и АТТ на объектах (ATU_ATT)
      { entity: 'operationalActivity', field: 'atu_att_pb', label: 'АТУ и АТТ сотрудниками ПБ', group: '7', groupName: 'БПиО - АТУ и АТТ на объектах', subgroup: '7.6', subgroupName: 'АТУ и АТТ' },
      { entity: 'operationalActivity', field: 'atu_att_law', label: 'АТУ и АТТ совместно с ПОО', group: '7', groupName: 'БПиО - АТУ и АТТ на объектах', subgroup: '7.6', subgroupName: 'АТУ и АТТ' },

      // БПиО - Взаимодействие с ЧОП/ЧОО (SECURITY_COMPANY)
      { entity: 'operationalActivity', field: 'chop_checks', label: 'Проведено проверок несения службы', group: '7', groupName: 'БПиО - Взаимодействие с ЧОП/ЧОО', subgroup: '7.7', subgroupName: 'Взаимодействие с ЧОП/ЧОО' },
      { entity: 'operationalActivity', field: 'chop_claims', label: 'Подготовлено претензий', group: '7', groupName: 'БПиО - Взаимодействие с ЧОП/ЧОО', subgroup: '7.7', subgroupName: 'Взаимодействие с ЧОП/ЧОО' },


      // КБ - Взаимодействие с правоохранительными органами (LAW_ENFORCEMENT)
      { entity: 'operationalActivity', field: 'cyber_incoming_paper_requests', label: 'Поступило входящих бумажных запросов ПОО на предоставление информации', group: '8', groupName: 'КБ - Взаимодействие с правоохранительными органами', subgroup: '8.1', subgroupName: 'Взаимодействие с ПОО' },
      { entity: 'operationalActivity', field: 'cyber_executed_paper_requests', label: 'Исполнено бумажных запросов ПОО на предоставление информации', group: '8', groupName: 'КБ - Взаимодействие с правоохранительными органами', subgroup: '8.1', subgroupName: 'Взаимодействие с ПОО' },
      { entity: 'operationalActivity', field: 'cyber_executed_paper_tasks', label: 'Исполнено заданий в бумажных запросах ПОО на предоставление информации', group: '8', groupName: 'КБ - Взаимодействие с правоохранительными органами', subgroup: '8.1', subgroupName: 'Взаимодействие с ПОО' },
      { entity: 'operationalActivity', field: 'cyber_received_presentations', label: 'Поступило представлений правоохранительных органов, прокуратуры и суда', group: '8', groupName: 'КБ - Взаимодействие с правоохранительными органами', subgroup: '8.1', subgroupName: 'Взаимодействие с ПОО' },
      { entity: 'operationalActivity', field: 'cyber_executed_presentations', label: 'из них исполнено (подготовлен ответ)', group: '8', groupName: 'КБ - Взаимодействие с правоохранительными органами', subgroup: '8.1', subgroupName: 'Взаимодействие с ПОО' },
    ];

    res.success(fields, 'Available fields retrieved successfully');
  }),

  /**
   * Получение данных таблицы отчетов с пагинацией
   */
  getReportTable: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    console.log('[getReportTable] Request started', { dateFrom: req.body.dateFrom, dateTo: req.body.dateTo });
    
    const { dateFrom, dateTo, departmentIds, page = 1, limit = 50, dataSource = 'live', reportType } = req.body;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать dateFrom и dateTo'
      });
    }

    if (dataSource !== 'live' && dataSource !== 'imported') {
      return res.status(400).json({
        success: false,
        message: 'dataSource должен быть live или imported',
      });
    }

    const ids = Array.isArray(departmentIds) && departmentIds.length > 0
      ? departmentIds.map((id: any) => Number(id))
      : [];

    // Генерируем ключ для этого запроса
    const requestKey = getRequestKey(dateFrom, dateTo, ids, Number(page), Number(limit)) + `_${dataSource}`;
    
    // Отменяем ВСЕ предыдущие активные запросы ДО начала обработки нового
    // Это гарантирует, что старые запросы не будут продолжаться параллельно
    cancelAllPreviousRequests();

    // Создаем новый AbortController для этого запроса
    const abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
    
    // Сохраняем активный запрос в глобальный массив
    if (abortController) {
      const requestEntry = { abortController, key: requestKey, timestamp: Date.now() };
      allActiveRequests.push(requestEntry);
    }
    
    // Устанавливаем обработчик закрытия соединения
    // НЕ отменяем запрос при закрытии соединения - это может быть преждевременное закрытие
    // Отменяем только через механизм cancelAllPreviousRequests при новом запросе
    if (abortController) {
      const cleanup = () => {
        const index = allActiveRequests.findIndex(r => r.abortController === abortController);
        if (index !== -1) {
          allActiveRequests.splice(index, 1);
        }
      };
      
      // Только логируем закрытие соединения, но НЕ отменяем запрос
      // Отмена будет происходить только через cancelAllPreviousRequests при новом запросе
      req.on('close', () => {
        console.log('[getReportTable] Request connection closed (not aborting - will check abortSignal in service)');
        // Не вызываем abort() - пусть сервис проверяет abortSignal
        // Очищаем из списка активных запросов только если запрос уже завершен
        // Но не отменяем его, так как это может быть преждевременное закрытие
      });
      
      req.on('aborted', () => {
        console.log('[getReportTable] Request aborted by client (not aborting - will check abortSignal in service)');
        // Не вызываем abort() - пусть сервис проверяет abortSignal
      });
    }

    try {
      // Проверяем, не был ли запрос уже отменен перед началом обработки
      if (abortController?.signal.aborted) {
        console.log('[getReportTable] Request was already aborted before service call, skipping');
        const index = allActiveRequests.findIndex(r => r.abortController === abortController);
        if (index !== -1) {
          allActiveRequests.splice(index, 1);
        }
        return;
      }
      
      console.log('[getReportTable] Starting service call');
      
      // Передаем abortSignal в сервис - он будет проверять его в циклах вычислений
      // Если запрос отменен, вычисления прервутся
      const result = await reportService.getReportTable({
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        departmentIds: ids,
        page: Number(page),
        limit: Number(limit),
        abortSignal: abortController?.signal,
        dataSource: dataSource === 'imported' ? 'imported' : 'live',
        reportType,
      });

      // Удаляем запрос из активных после успешного завершения
      const index = allActiveRequests.findIndex(r => r.abortController === abortController);
      if (index !== -1) {
        allActiveRequests.splice(index, 1);
      }

      // Проверяем, не был ли запрос отменен во время выполнения
      if (abortController?.signal.aborted) {
        console.log('[getReportTable] Request was aborted during computation, not sending response');
        if (!res.headersSent) {
          // Не отправляем ответ - соединение уже закрыто клиентом
          return;
        }
        return;
      }

      console.log('[getReportTable] Sending success response');
      res.success(result, 'Report table data retrieved successfully');
    } catch (error: any) {
      // Удаляем запрос из активных при ошибке
      if (abortController) {
        const index = allActiveRequests.findIndex(r => r.abortController === abortController);
        if (index !== -1) {
          allActiveRequests.splice(index, 1);
        }
      }
      
      // Проверяем, не был ли запрос отменен
      const isAbortError = 
        error?.name === 'AbortError' || 
        error?.message === 'Request aborted' || 
        abortController?.signal.aborted;
      
      if (isAbortError) {
        console.log('[getReportTable] Request aborted, not sending response');
        // Не отправляем ответ и не пробрасываем ошибку - просто завершаем обработку
        // Axios сам обработает закрытие соединения на клиенте
        if (!res.headersSent) {
          // Просто завершаем без отправки ответа
          return;
        }
        return;
      }
      
      // Для всех остальных ошибок логируем и пробрасываем
      console.error('[getReportTable] Error:', error.message, error.stack);
      throw error;
    }
  }),

  /**
   * Выгрузка выбранного разреза в Excel
   */
  exportReport: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { dateFrom, dateTo, departmentIds, fieldKeys, dataSource = 'live', reportType } = req.body;

    if (!dateFrom || !dateTo || !departmentIds || !Array.isArray(departmentIds) || !fieldKeys || !Array.isArray(fieldKeys)) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать dateFrom, dateTo, departmentIds (массив) и fieldKeys (массив)'
      });
    }

    const buffer = await reportService.exportSelectedReport({
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      departmentIds: departmentIds.map((id: any) => Number(id)),
      fieldKeys: fieldKeys,
      dataSource: dataSource === 'imported' ? 'imported' : 'live',
      reportType,
    });

    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const fromMonth = monthNames[fromDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toMonth = monthNames[toDate.getMonth()];
    const toYear = toDate.getFullYear();

    const fileName = fromMonth === toMonth && fromYear === toYear
      ? `Отчет_${fromMonth}_${fromYear}.xlsx`
      : `Отчет_${fromMonth}_${fromYear}_${toMonth}_${toYear}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  }),

  /**
   * Выгрузка дашборда в Excel (график по месяцам + круговые по показателям)
   */
  exportDashboard: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { dateFrom, dateTo, departmentIds, fieldKeys, dataSource = 'live' } = req.body;

    if (dataSource === 'imported') {
      return res.status(400).json({
        success: false,
        message: 'Дашборд для архивных отчётов недоступен',
      });
    }

    if (!dateFrom || !dateTo || !departmentIds || !Array.isArray(departmentIds) || !fieldKeys || !Array.isArray(fieldKeys)) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать dateFrom, dateTo, departmentIds (массив) и fieldKeys (массив)'
      });
    }

    const buffer = await reportService.exportDashboard({
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      departmentIds: departmentIds.map((id: unknown) => Number(id)),
      fieldKeys: fieldKeys,
      dataSource: 'live',
    });

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const fileName = `Дашборд_${dd}-${mm}-${yyyy}-${hh}${min}${ss}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  }),

  listImports: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const { reportType, periodFrom, periodTo, status } = req.query;
    const batches = await reportImportService.listBatches({
      reportType: typeof reportType === 'string' ? reportType : undefined,
      periodFrom: typeof periodFrom === 'string' ? periodFrom : undefined,
      periodTo: typeof periodTo === 'string' ? periodTo : undefined,
      status: typeof status === 'string' ? status : undefined,
    });
    res.success(batches, 'Report imports retrieved successfully');
  }),

  uploadImport: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const mreq = req as MulterRequest;
    const file = mreq.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Необходимо загрузить файл Excel (.xlsx)' });
    }

    if (!file.path) {
      return res.status(400).json({ success: false, message: 'Файл не сохранён на диск' });
    }

    const periodFrom = (req.body.periodFrom || req.body.period_from) as string | undefined;
    const periodTo = (req.body.periodTo || req.body.period_to) as string | undefined;
    const reportType = (req.body.reportType || req.body.report_type || REPORT_TYPE_RP053_MATRIX) as string;

    const uploadedBy = (req as Request & { user?: { sub?: string } }).user?.sub ?? null;

    try {
      const batch = await reportImportService.importExcel({
        filePath: file.path,
        originalName: file.originalname || 'report.xlsx',
        periodFrom: periodFrom || null,
        periodTo: periodTo || null,
        reportType,
        uploadedBy,
      });
      // temp multer file can be removed if we copied it
      if (fs.existsSync(file.path) && batch.storage_path !== file.path) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          /* ignore */
        }
      }
      const periodHint =
        batch.period_from && batch.period_to
          ? ` (период ${String(batch.period_from).slice(0, 10)} — ${String(batch.period_to).slice(0, 10)})`
          : '';
      res.success(
        batch,
        batch.status === 'active'
          ? `Отчёт импортирован${periodHint}`
          : `Импорт завершился с ошибкой${periodHint}`
      );
    } catch (err) {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          /* ignore */
        }
      }
      throw err;
    }
  }),

  activateImport: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Некорректный id' });
    }
    const batch = await reportImportService.activateBatch(id);
    res.success(batch, 'Батч активирован');
  }),

  deleteImport: asyncErrorHandler(async (req: Request, res: CustomResponse) => {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Некорректный id' });
    }
    await reportImportService.deleteBatch(id);
    res.success(null, 'Импорт удалён');
  }),
};
