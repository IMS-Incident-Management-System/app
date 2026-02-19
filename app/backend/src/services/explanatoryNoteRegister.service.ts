import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import {
  Event,
  Incident,
  IncidentEvent,
  IncidentEventType,
  Additionally,
  Department,
  EventPunishment,
  EventCriminalCase,
  Punishment,
  CriminalCase,
} from '../models';
import { PaginatedQuery } from '../utils/pagination';

export type RegisterRecordType = 'incident' | 'event' | 'additionally';

/** Тип инцидента — из событий инцидента, с иерархией родитель/дочерний, без дублей */
function getIncidentTypeTitles(incident: {
  events?: Array<{ event_type?: { event_type_id?: number; title?: string; parent?: { title?: string } } }>;
}): string {
  const events = incident.events || [];
  const seenIds = new Set<number>();
  const labels: string[] = [];
  for (const e of events) {
    const et = e.event_type;
    if (!et) continue;
    const id = et.event_type_id;
    if (id == null || seenIds.has(id)) continue;
    seenIds.add(id);
    const title = et.title;
    if (!title) continue;
    const parentTitle = et.parent?.title;
    labels.push(parentTitle ? `${parentTitle} / ${title}` : title);
  }
  return labels.join(', ') || '';
}

export interface ExplanatoryNoteRegisterRow {
  id: number;
  type: RegisterRecordType;
  typeLabel: string;
  /** Тип инцидента (Кражи, Пожары и т.д. из событий) — только для инцидентов и дополнений */
  incident_type: string;
  /** Отображаемый ID (код IN-/EV-..., либо id дополнения) */
  display_id: string;
  kc_r: string;
  p: string;
  period_from: string;
  period_to: string;
  period?: string;
  entry_date: string;
  event_info: string;
  service_investigation_count: number;   // Кол-во СР
  service_check_count: number;           // Кол-во СП
  service_check_ib_count: number;        // Кол-во СП ИБ
  verification_activity_count: number;   // Кол-во ПМ
  punished_count: number;
  dismissed_count: number;
  materials_transferred_count: number;
  cases_initiated_count: number;
  detected_damage: number;
  recovered_damage: number;
  recovered_receivables: number;
  prevented_damage: number;
  reduced_cost: number;
  prevented_writeoff_receivables: number;
  additional_income: number;
  vat_deducted: number;
  source_id: number;  // для навигации к исходной записи
}

interface GetRegisterFilters {
  department_id?: number;
  period_from?: Date;
  period_to?: Date;
  entry_date_from?: Date;
  entry_date_to?: Date;
  kc_r?: string[];
  p?: string[];
  type?: ('incident' | 'event' | 'additionally')[];
  incident_type?: string[];
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  // строка с датой из БД (DATEONLY и т.п.)
  const str = String(value);
  // ожидаем формат YYYY-MM-DD или ISO
  return str.split('T')[0];
}

async function getDepartmentWithParent(departmentId: number): Promise<{ kc_r: string; p: string }> {
  const dept = await Department.findByPk(departmentId);
  if (!dept) return { kc_r: '', p: '' };

  // Собираем всю цепочку от корня до текущего подразделения
  const chain: typeof dept[] = [];
  let current: typeof dept | null = dept;
  while (current) {
    chain.unshift(current);
    if (!current.parent_id) break;
    current = await Department.findByPk(current.parent_id);
  }

  // По умолчанию: как было — верхний уровень = корневое подразделение
  let kc_r = chain[0]?.title ?? '';

  // Если глубина иерархии >= 3 (например: КЦ -> ФО -> ДАФ),
  // то для КЦ/Р показываем ВТОРОЙ уровень (ФО), а в Р — конечное подразделение.
  if (chain.length >= 3) {
    kc_r = chain[1].title;
  }

  // Если Р = Москва, то КЦ/Р тоже Москва
  if (dept.title === 'Москва') {
    kc_r = 'Москва';
  }

  return {
    kc_r,
    p: dept.title,
  };
}

function toNum(v: number | null | undefined): number {
  return v ?? 0;
}

export const explanatoryNoteRegisterService = {
  async getRegister({ filters, pagination }: PaginatedQuery<GetRegisterFilters>) {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const periodFrom = filters?.period_from || defaultFrom;
    const periodTo = filters?.period_to || defaultTo;
    const periodToEnd = new Date(periodTo);
    periodToEnd.setHours(23, 59, 59, 999);

    const dateRange = { [Op.between]: [periodFrom, periodToEnd] as [Date, Date] };
    const allRows: ExplanatoryNoteRegisterRow[] = [];

    // 1. События (Events)
    const eventWhere: any = {
      [Op.or]: [
        { entry_date: dateRange },
        { date: dateRange },
      ],
    };
    if (filters?.department_id) eventWhere.department_id = filters.department_id;

    const events = await Event.findAll({
      where: eventWhere,
      include: [
        { model: Department, as: 'department' },
        { model: EventPunishment, as: 'punishment', required: false },
        { model: EventCriminalCase, as: 'criminal_case', required: false },
      ],
      order: [['entry_date', 'DESC'], ['date', 'DESC'], ['id', 'DESC']],
    });

    for (const ev of events) {
      const hierarchy = await getDepartmentWithParent(ev.department_id);
      const punishment = (ev as any).punishment;
      const criminalCase = (ev as any).criminal_case;

      const hasSR = ev.is_service_investigation || ev.is_service_investigation_ib ||
        ev.is_service_investigation_bpio || ev.is_service_investigation_bpio_hotline;
      const hasSP = ev.is_service_check || ev.is_service_check_bpio || ev.is_service_check_bpio_hotline;

      const punishedCount = toNum(punishment?.warning_letter_rp398) + toNum(punishment?.remark) + toNum(punishment?.reprimand);
      const materialsTransferred = (criminalCase && (criminalCase.transfer_date || criminalCase.document_number)) ? 1 : 0;
      // ТЗ: Дата возбуждения и/или Номер дела. Дополнительно: если есть осуждённые/решение суда — дело было возбуждено
      const hasCaseInitiated = criminalCase && (
        criminalCase.case_date || criminalCase.case_number ||
        (toNum(criminalCase.convicted_count) > 0) || !!criminalCase.court_decision
      );
      const casesInitiated = hasCaseInitiated ? 1 : 0;

      const pFrom = periodFrom.toISOString().split('T')[0];
      const pTo = periodTo.toISOString().split('T')[0];
      allRows.push({
        id: ev.id,
        type: 'event',
        typeLabel: 'событие',
        incident_type: '',
        display_id: ev.code || String(ev.id),
        kc_r: hierarchy.kc_r,
        p: hierarchy.p,
        period_from: pFrom,
        period_to: pTo,
        period: `${pFrom} - ${pTo}`,
        entry_date: formatDate(ev.entry_date || ev.date),
        event_info: ev.description || '',
        service_investigation_count: hasSR ? 1 : 0,
        service_check_count: hasSP ? 1 : 0,
        service_check_ib_count: ev.is_service_check_ib ? 1 : 0,
        verification_activity_count: ev.is_verification_activity ? 1 : 0,
        punished_count: punishedCount,
        dismissed_count: toNum(punishment?.dismissed_count),
        materials_transferred_count: materialsTransferred,
        cases_initiated_count: casesInitiated,
        detected_damage: toNum(ev.detected_damage),
        recovered_damage: toNum(ev.recovered_damage),
        recovered_receivables: 0,
        prevented_damage: toNum(ev.prevented_damage),
        reduced_cost: toNum(ev.reduced_cost),
        prevented_writeoff_receivables: toNum(ev.prevented_unnecessary_writeoff),
        additional_income: toNum(ev.additional_income),
        vat_deducted: toNum(ev.vat_deducted),
        source_id: ev.id,
      });
    }

    // 2. Инциденты (Incidents) - по датам событий инцидента
    const incidentEventWhere: any = {
      date: dateRange,
    };
    // department_id фильтруем уже на уровне инцидента

    const incidentEvents = await IncidentEvent.findAll({
      attributes: ['incident_id'],
      where: incidentEventWhere,
      group: ['incident_id'],
    });

    const incidentIds = Array.from(
      new Set(incidentEvents.map((ie) => ie.incident_id))
    );

    if (incidentIds.length > 0) {
      const incidentWhere: any = {
        id: incidentIds,
      };
      if (filters?.department_id) incidentWhere.department_id = filters.department_id;

      const incidents = await Incident.findAll({
        where: incidentWhere,
        include: [
          { model: Department, as: 'department' },
          {
            model: IncidentEvent,
            as: 'events',
            required: false,
            include: [{
              model: IncidentEventType,
              as: 'event_type',
              include: [{ model: IncidentEventType, as: 'parent', attributes: ['event_type_id', 'title'] }],
            }],
          },
        ],
        order: [['id', 'DESC']],
      });

      for (const inc of incidents) {
        const hierarchy = await getDepartmentWithParent(inc.department_id);
        const pFromInc = periodFrom.toISOString().split('T')[0];
        const pToInc = periodTo.toISOString().split('T')[0];
        allRows.push({
          id: inc.id,
          type: 'incident',
          typeLabel: 'инцидент',
          incident_type: getIncidentTypeTitles(inc),
          display_id: (inc as any).code || String(inc.id),
          kc_r: hierarchy.kc_r,
          p: hierarchy.p,
          period_from: pFromInc,
          period_to: pToInc,
          period: `${pFromInc} - ${pToInc}`,
        // Для инцидента дата внесения не хранится отдельно, используем конец выбранного периода как реперную дату
        entry_date: pToInc,
          event_info: inc.description || '',
          service_investigation_count: 0,
          service_check_count: 0,
          service_check_ib_count: 0,
          verification_activity_count: 0,
          punished_count: 0,
          dismissed_count: 0,
          materials_transferred_count: 0,
          cases_initiated_count: 0,
          detected_damage: toNum(inc.detected_damage),
          recovered_damage: toNum(inc.recovered_damage),
          recovered_receivables: 0,
          prevented_damage: toNum(inc.prevented_damage),
          reduced_cost: toNum(inc.reduced_cost),
          prevented_writeoff_receivables: 0,
          additional_income: toNum(inc.additional_income),
          vat_deducted: 0,
          source_id: inc.id,
        });
      }
    }

    // 3. Дополнения к инцидентам (Additionally)
    const addWhere: any = {
      [Op.or]: [
        { addition_date: dateRange },
        { createdAt: dateRange } as any,
      ],
    };

    const additions = await Additionally.findAll({
      where: addWhere,
      include: [
        {
          model: Incident,
          as: 'incident',
          required: true,
          where: filters?.department_id ? { department_id: filters.department_id } : undefined,
          include: [
            { model: Department, as: 'department' },
            {
              model: IncidentEvent,
              as: 'events',
              required: false,
              include: [{
                model: IncidentEventType,
                as: 'event_type',
                include: [{ model: IncidentEventType, as: 'parent', attributes: ['event_type_id', 'title'] }],
              }],
            },
          ],
        },
        { model: Punishment, as: 'punishment', required: false },
        { model: CriminalCase, as: 'criminal_case', required: false },
      ],
      order: [['addition_date', 'DESC'], ['id', 'DESC']],
    });

    for (const add of additions) {
      const inc = (add as any).incident;

      const hierarchy = await getDepartmentWithParent(inc.department_id);
      const punishment = (add as any).punishment;
      const criminalCase = (add as any).criminal_case;

      const punishedCount = toNum(punishment?.warning_letter_rp398) + toNum(punishment?.remark) + toNum(punishment?.reprimand);
      const materialsTransferred = (criminalCase && (criminalCase.transfer_date || criminalCase.document_number)) ? 1 : 0;
      const hasCaseInitiatedAdd = criminalCase && (
        criminalCase.case_date || criminalCase.case_number ||
        (toNum(criminalCase.convicted_count) > 0) || !!criminalCase.court_decision
      );
      const casesInitiated = hasCaseInitiatedAdd ? 1 : 0;

      const pFromAdd = periodFrom.toISOString().split('T')[0];
      const pToAdd = periodTo.toISOString().split('T')[0];
      allRows.push({
        id: add.id,
        type: 'additionally',
        typeLabel: 'дополнение к инциденту',
        incident_type: getIncidentTypeTitles(inc),
        // Для дополнения показываем ID инцидента (код IN-...), чтобы было понятно, где искать
        display_id: (inc as any).code || String(inc.id),
        kc_r: hierarchy.kc_r,
        p: hierarchy.p,
        period_from: pFromAdd,
        period_to: pToAdd,
        period: `${pFromAdd} - ${pToAdd}`,
        entry_date: formatDate(add.addition_date || (add as any).createdAt),
        event_info: add.text_field || '',
        service_investigation_count: 0,
        service_check_count: 0,
        service_check_ib_count: 0,
        verification_activity_count: 0,
        punished_count: punishedCount,
        dismissed_count: toNum(punishment?.dismissed_count),
        materials_transferred_count: materialsTransferred,
        cases_initiated_count: casesInitiated,
        detected_damage: toNum(add.detected_damage),
        recovered_damage: toNum(add.recovered_damage),
        recovered_receivables: 0,
        prevented_damage: toNum(add.prevented_damage),
        reduced_cost: toNum(add.reduced_cost),
        prevented_writeoff_receivables: 0,
        additional_income: toNum(add.additional_income),
        vat_deducted: 0,
        source_id: add.id,
      });
    }

    // Фильтры по КЦ/Р, Р, Тип, Тип инцидента (множественный выбор)
    let filteredRows = allRows;
    if (filters?.kc_r && filters.kc_r.length > 0) {
      filteredRows = filteredRows.filter(r => filters.kc_r!.includes(r.kc_r));
    }
    if (filters?.p && filters.p.length > 0) {
      filteredRows = filteredRows.filter(r => filters.p!.includes(r.p));
    }
    if (filters?.type && filters.type.length > 0) {
      filteredRows = filteredRows.filter(r => filters.type!.includes(r.type));
    }
    if (filters?.incident_type && filters.incident_type.length > 0) {
      filteredRows = filteredRows.filter(r => r.incident_type && r.incident_type.split(', ').some(t => filters.incident_type!.includes(t.trim())));
    }

    // Варианты для фильтров (из всех записей в периоде, до применения фильтров)
    const filterOptions = {
      kc_r: [...new Set(allRows.map(r => r.kc_r).filter(Boolean))].sort(),
      p: [...new Set(allRows.map(r => r.p).filter(Boolean))].sort(),
      type: ['incident', 'event', 'additionally'] as const,
      incident_type: [...new Set(allRows.flatMap(r => r.incident_type ? r.incident_type.split(', ').map(t => t.trim()).filter(Boolean) : []))].sort(),
    };

    // Сортировка по дате внесения
    filteredRows.sort((a, b) => {
      const dateA = new Date(a.entry_date).getTime();
      const dateB = new Date(b.entry_date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.id - a.id;
    });

    // Пагинация вручную и добавление номера строки
    const total = filteredRows.length;
    const page = pagination.page;
    const limit = pagination.limit;
    const offset = (page - 1) * limit;
    const sliced = filteredRows.slice(offset, offset + limit);
    const items = sliced.map((row, idx) => ({
      ...row,
      number: offset + idx + 1,
    }));

    // Итоги по отфильтрованным записям
    const totals = filteredRows.reduce((acc, row) => ({
      service_investigation_count: acc.service_investigation_count + row.service_investigation_count,
      service_check_count: acc.service_check_count + row.service_check_count,
      service_check_ib_count: acc.service_check_ib_count + row.service_check_ib_count,
      verification_activity_count: acc.verification_activity_count + row.verification_activity_count,
      punished_count: acc.punished_count + row.punished_count,
      dismissed_count: acc.dismissed_count + row.dismissed_count,
      materials_transferred_count: acc.materials_transferred_count + row.materials_transferred_count,
      cases_initiated_count: acc.cases_initiated_count + row.cases_initiated_count,
      detected_damage: acc.detected_damage + row.detected_damage,
      recovered_damage: acc.recovered_damage + row.recovered_damage,
      recovered_receivables: acc.recovered_receivables + row.recovered_receivables,
      prevented_damage: acc.prevented_damage + row.prevented_damage,
      reduced_cost: acc.reduced_cost + row.reduced_cost,
      prevented_writeoff_receivables: acc.prevented_writeoff_receivables + row.prevented_writeoff_receivables,
      additional_income: acc.additional_income + row.additional_income,
      vat_deducted: acc.vat_deducted + row.vat_deducted,
    }), {
      service_investigation_count: 0,
      service_check_count: 0,
      service_check_ib_count: 0,
      verification_activity_count: 0,
      punished_count: 0,
      dismissed_count: 0,
      materials_transferred_count: 0,
      cases_initiated_count: 0,
      detected_damage: 0,
      recovered_damage: 0,
      recovered_receivables: 0,
      prevented_damage: 0,
      reduced_cost: 0,
      prevented_writeoff_receivables: 0,
      additional_income: 0,
      vat_deducted: 0,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totals,
      filterOptions,
    };
  },

  /** Выгрузка реестра в Excel */
  async exportToExcel(filters?: GetRegisterFilters): Promise<ExcelJS.Buffer> {
    const result = await this.getRegister({
      filters,
      pagination: { page: 1, limit: 999999 },
    });

    const fmtDateLocale = (d: Date | string) => {
      const date = d instanceof Date ? d : new Date(d);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
    };
    const periodFrom = filters?.period_from || result.items[0]?.period_from
      ? new Date((filters?.period_from || result.items[0]?.period_from) as string | Date)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodTo = filters?.period_to || result.items[0]?.period_to
      ? new Date((filters?.period_to || result.items[0]?.period_to) as string | Date)
      : new Date();
    const titleText = `Пояснительная записка с ${fmtDateLocale(periodFrom)} по ${fmtDateLocale(periodTo)}`;

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Пояснительная записка', {
      views: [{ state: 'frozen', ySplit: 2 }],
    });

    const titleRow = ws.addRow([titleText]);
    ws.mergeCells(1, 1, 1, 25);
    const titleCell = titleRow.getCell(1);
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 28;

    const headers = [
      '№', 'ID', 'КЦ/Р', 'Р', 'Период', 'Дата', 'Тип', 'Тип инцидента', 'Информация о событии',
      'Кол-во СР', 'Кол-во СП', 'Кол-во СП ИБ', 'Кол-во ПМ', 'Кол-во наказано', 'Кол-во уволено',
      'Кол-во передано материалов', 'Кол-во возбуждено УД/АД',
      'Выявлен ущерб, руб.', 'Возмещен ущерб, руб.', 'Возмещена ДЗ, руб.', 'Предотвращен ущерб, руб.',
      'Снижена стоимость закупки, договора, доп.согл., руб.',
      'Предотвращено необ. списание ДЗ, руб.', 'Получен доп. доход, руб.', 'Принят к вычету НДС, руб.',
    ];

    const colWidths = [
      6, 12, 12, 18, 22, 12, 18, 18, 50,  // №, ID, КЦ/Р, Р, Период, Дата, Тип, Тип инцидента, Информация о событии
      12, 12, 14, 12, 14, 14, 22, 22,     // Кол-во столбцы
      18, 18, 18, 22, 32, 28, 20, 22,     // руб.
    ];

    ws.addRow(headers);
    const headerRow = ws.getRow(2);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8E8E8' },
    };
    headerRow.alignment = { vertical: 'middle', wrapText: true };
    headerRow.height = 30;

    const fmtDate = (s: string) => {
      if (!s) return '';
      const d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString('ru-RU');
    };

    const alignmentBase = { vertical: 'middle' as const, wrapText: true };
    const alignmentCenter = { ...alignmentBase, horizontal: 'center' as const };

    for (const row of result.items) {
      const r = ws.addRow([
        row.number,
        row.display_id,
        row.kc_r,
        row.p,
        row.period || `${row.period_from ?? ''} - ${row.period_to ?? ''}`,
        fmtDate(row.entry_date),
        row.typeLabel,
        row.incident_type ?? '',
        row.event_info ?? '',
        row.service_investigation_count ?? 0,
        row.service_check_count ?? 0,
        row.service_check_ib_count ?? 0,
        row.verification_activity_count ?? 0,
        row.punished_count ?? 0,
        row.dismissed_count ?? 0,
        row.materials_transferred_count ?? 0,
        row.cases_initiated_count ?? 0,
        row.detected_damage ?? 0,
        row.recovered_damage ?? 0,
        row.recovered_receivables ?? 0,
        row.prevented_damage ?? 0,
        row.reduced_cost ?? 0,
        row.prevented_writeoff_receivables ?? 0,
        row.additional_income ?? 0,
        row.vat_deducted ?? 0,
      ]);
      r.alignment = alignmentBase;
      r.eachCell((cell, colNumber) => {
        if (colNumber <= 9) cell.alignment = alignmentBase;
        else cell.alignment = alignmentCenter;
      });
    }

    const t = result.totals;
    if (t) {
      ws.addRow([]);
      const totalsRow = ws.addRow([
        'Итого', '', '', '', '', '', '', '', '',
        t.service_investigation_count ?? 0,
        t.service_check_count ?? 0,
        t.service_check_ib_count ?? 0,
        t.verification_activity_count ?? 0,
        t.punished_count ?? 0,
        t.dismissed_count ?? 0,
        t.materials_transferred_count ?? 0,
        t.cases_initiated_count ?? 0,
        t.detected_damage ?? 0,
        t.recovered_damage ?? 0,
        t.recovered_receivables ?? 0,
        t.prevented_damage ?? 0,
        t.reduced_cost ?? 0,
        t.prevented_writeoff_receivables ?? 0,
        t.additional_income ?? 0,
        t.vat_deducted ?? 0,
      ]);
      totalsRow.font = { bold: true };
      totalsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' },
      };
      totalsRow.alignment = alignmentBase;
      totalsRow.eachCell((cell, colNumber) => {
        if (colNumber > 9) cell.alignment = alignmentCenter;
      });
    }

    colWidths.forEach((w, i) => {
      if (ws.columns[i]) ws.columns[i].width = Math.min(Math.max(w, 10), 50);
    });

    ws.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    return (await workbook.xlsx.writeBuffer()) as ExcelJS.Buffer;
  },
};

