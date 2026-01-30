import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Incident, Event, OperationalActivity, Department } from '../models';
import { REPORT_FIELDS } from '../constants/reportFields';
import { computeFieldValueByRule } from './reportCalculator';

interface ReportField {
  entity: 'incident' | 'event' | 'operationalActivity';
  field: string;
  label: string;
}

interface ReportRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  fields?: ReportField[];
  /** Ключи полей из REPORT_FIELDS (r1..r160) — при наличии используются правила расчёта */
  fieldKeys?: string[];
}

interface TableRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  page: number;
  limit: number;
  abortSignal?: AbortSignal;
}

interface ExportRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  fieldKeys: string[];
}

const BOOLEAN_FIELDS = new Set([
  'is_service_investigation', 'is_service_investigation_ib', 'is_service_investigation_bpio',
  'is_service_investigation_bpio_hotline', 'is_service_check', 'is_service_check_ib',
  'is_service_check_bpio', 'is_service_check_bpio_hotline', 'is_verification_activity', 'is_db'
]);

async function computeFieldValueLegacy(
  field: ReportField,
  departmentId: number,
  dateFrom: Date,
  dateTo: Date
): Promise<number> {
  const dateToEnd = new Date(dateTo);
  dateToEnd.setHours(23, 59, 59, 999);
  const isBoolean = BOOLEAN_FIELDS.has(field.field);
  const whereBase = {
    department_id: departmentId,
    createdAt: { [Op.between]: [dateFrom, dateToEnd] } as any,
  };

  if (field.entity === 'incident') {
    if (isBoolean) {
      const count = await Incident.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await Incident.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  if (field.entity === 'event') {
    if (isBoolean) {
      const count = await Event.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await Event.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  if (field.entity === 'operationalActivity') {
    if (isBoolean) {
      const count = await OperationalActivity.count({ where: { ...whereBase, [field.field]: true } as any });
      return count;
    }
    const sum = await OperationalActivity.sum(field.field as any, { where: whereBase } as any);
    return Number(sum) || 0;
  }
  return 0;
}

export const reportService = {
  /**
   * Генерация Excel отчета
   */
  async generateReport(request: ReportRequest): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчет');

    const departments = await Department.findAll({
      where: { department_id: { [Op.in]: request.departmentIds } },
    });
    const departmentMap = new Map(departments.map((d) => [d.department_id, d.title]));
    const fieldData = new Map<string, Map<number, number>>();
    const booleanFields = new Set([
      'is_service_investigation', 'is_service_investigation_ib', 'is_service_investigation_bpio',
      'is_service_investigation_bpio_hotline', 'is_service_check', 'is_service_check_ib',
      'is_service_check_bpio', 'is_service_check_bpio_hotline', 'is_verification_activity', 'is_db'
    ]);

    const dateToEndOfDay = new Date(request.dateTo);
    dateToEndOfDay.setHours(23, 59, 59, 999);

    // Функция для получения всех потомков департамента
    const allDepartmentsForCalc = await Department.findAll();
    const getAllDescendants = (parentId: number): number[] => {
      const result = [parentId];
      const children = allDepartmentsForCalc.filter((d) => d.parent_id === parentId);
      for (const child of children) {
        result.push(...getAllDescendants(child.department_id));
      }
      return result;
    };

    if (request.fieldKeys && request.fieldKeys.length > 0) {
      const defs = request.fieldKeys
        .map((k) => REPORT_FIELDS.find((f) => f.key === k))
        .filter((f): f is NonNullable<typeof f> => f != null);
      for (const def of defs) {
        const dataMap = new Map<number, number>();
        for (const departmentId of request.departmentIds) {
          // Получаем всех потомков (включая сам департамент)
          const deptWithDescendants = getAllDescendants(departmentId);
          
          // Суммируем значения для департамента и всех его потомков
          let totalValue = 0;
          for (const deptId of deptWithDescendants) {
            const value = await computeFieldValueByRule(def, deptId, request.dateFrom, dateToEndOfDay);
            totalValue += value;
          }
          
          dataMap.set(departmentId, totalValue);
        }
        fieldData.set(def.key, dataMap);
      }
    } else if (request.fields && request.fields.length > 0) {
      for (const field of request.fields) {
        const dataMap = new Map<number, number>();
        const isBooleanField = booleanFields.has(field.field);
        for (const departmentId of request.departmentIds) {
          // Получаем всех потомков (включая сам департамент)
          const deptWithDescendants = getAllDescendants(departmentId);
          let totalValue = 0;
          
          for (const deptId of deptWithDescendants) {
            let value = 0;
            if (field.entity === 'incident') {
              if (isBooleanField) {
                value = (await Incident.count({
                  where: {
                    department_id: deptId,
                    createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                    [field.field]: true,
                  } as any,
                })) as number;
              } else {
                const whereOpt = { where: { department_id: deptId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
                value = Number(await Incident.sum(field.field as any, whereOpt)) || 0;
              }
            } else if (field.entity === 'event') {
              if (isBooleanField) {
                value = (await Event.count({
                  where: {
                    department_id: deptId,
                    createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                    [field.field]: true,
                  } as any,
                })) as number;
              } else {
                const whereOpt = { where: { department_id: deptId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
                value = Number(await Event.sum(field.field as any, whereOpt)) || 0;
              }
            } else if (field.entity === 'operationalActivity') {
              if (isBooleanField) {
                value = (await OperationalActivity.count({
                  where: {
                    department_id: deptId,
                    createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] },
                    [field.field]: true,
                  } as any,
                })) as number;
              } else {
                const whereOpt = { where: { department_id: deptId, createdAt: { [Op.between]: [request.dateFrom, dateToEndOfDay] } } } as any;
                value = Number(await OperationalActivity.sum(field.field as any, whereOpt)) || 0;
              }
            }
            totalValue += value;
          }
          
          dataMap.set(departmentId, totalValue);
        }
        fieldData.set(`${field.entity}.${field.field}`, dataMap);
      }
    }

    // Формируем заголовок отчета
    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    const fromMonth = monthNames[fromDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toMonth = monthNames[toDate.getMonth()];
    const toYear = toDate.getFullYear();

    const reportTitle = fromMonth === toMonth && fromYear === toYear
      ? `Результаты работы ${fromMonth} ${fromYear}`
      : `Результаты работы ${fromMonth} ${fromYear} - ${toMonth} ${toYear}`;

    // Заголовок отчета
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = reportTitle;
    titleRow.getCell(1).font = { size: 18, bold: true };
    worksheet.mergeCells(1, 1, 1, Math.max(1, request.departmentIds.length + 3));

    // Определяем департаменты ПАО МТС (белый список)
    const paoMtsDepartmentNames = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];
    const paoMtsIdsForExcel = new Set<number>();
    
    for (const name of paoMtsDepartmentNames) {
      const dept = allDepartmentsForCalc.find((d) => d.title === name);
      if (dept) {
        // Добавляем департамент и всех его потомков
        getAllDescendants(dept.department_id).forEach(id => paoMtsIdsForExcel.add(id));
      }
    }

    const headerRow = worksheet.getRow(2);
    headerRow.getCell(1).value = 'Показатель';
    headerRow.getCell(1).font = { bold: true };
    request.departmentIds.forEach((deptId, index) => {
      headerRow.getCell(index + 2).value = departmentMap.get(deptId) || `Департамент ${deptId}`;
      headerRow.getCell(index + 2).font = { bold: true };
    });
    
    // Добавляем заголовки итоговых столбцов
    const totalGkCol = request.departmentIds.length + 2;
    const totalPaoCol = request.departmentIds.length + 3;
    headerRow.getCell(totalGkCol).value = 'Итого ГК МТС';
    headerRow.getCell(totalGkCol).font = { bold: true };
    headerRow.getCell(totalPaoCol).value = 'Итого ПАО МТС';
    headerRow.getCell(totalPaoCol).font = { bold: true };

    const outputFields: Array<{ label: string; dataKey: string }> =
      request.fieldKeys && request.fieldKeys.length > 0
        ? (request.fieldKeys
            .map((k) => REPORT_FIELDS.find((f) => f.key === k))
            .filter((f): f is NonNullable<typeof f> => f != null)
            .map((def) => ({ label: def.label, dataKey: def.key })))
        : (request.fields || []).map((f) => ({ label: f.label, dataKey: `${f.entity}.${f.field}` }));

    let currentRow = 3;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'ИТОГО';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    
    let grandTotalGk = 0;
    let grandTotalPao = 0;
    
    request.departmentIds.forEach((deptId, index) => {
      let totalSum = 0;
      for (const { dataKey } of outputFields) {
        const dataMap = fieldData.get(dataKey);
        if (dataMap) totalSum += dataMap.get(deptId) || 0;
      }
      const cell = totalRow.getCell(index + 2);
      cell.value = totalSum;
      cell.numFmt = '#,##0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
      
      grandTotalGk += totalSum;
      if (paoMtsIdsForExcel.has(deptId)) {
        grandTotalPao += totalSum;
      }
    });
    
    // Итоговые столбцы для строки ИТОГО
    const totalGkCell = totalRow.getCell(totalGkCol);
    totalGkCell.value = grandTotalGk;
    totalGkCell.numFmt = '#,##0';
    totalGkCell.font = { bold: true };
    totalGkCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    
    const totalPaoCell = totalRow.getCell(totalPaoCol);
    totalPaoCell.value = grandTotalPao;
    totalPaoCell.numFmt = '#,##0';
    totalPaoCell.font = { bold: true };
    totalPaoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
    
    currentRow++;

    for (const { label, dataKey } of outputFields) {
      const dataRow = worksheet.getRow(currentRow);
      dataRow.getCell(1).value = label;
      
      let rowTotalGk = 0;
      let rowTotalPao = 0;
      
      request.departmentIds.forEach((deptId, index) => {
        const value = (fieldData.get(dataKey)?.get(deptId)) ?? 0;
        const cell = dataRow.getCell(index + 2);
        cell.value = value;
        cell.numFmt = '#,##0';
        
        rowTotalGk += value;
        if (paoMtsIdsForExcel.has(deptId)) {
          rowTotalPao += value;
        }
      });
      
      // Добавляем итоговые столбцы для каждой строки
      const rowGkCell = dataRow.getCell(totalGkCol);
      rowGkCell.value = rowTotalGk;
      rowGkCell.numFmt = '#,##0';
      rowGkCell.font = { bold: true };
      rowGkCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };
      
      const rowPaoCell = dataRow.getCell(totalPaoCol);
      rowPaoCell.value = rowTotalPao;
      rowPaoCell.numFmt = '#,##0';
      rowPaoCell.font = { bold: true };
      rowPaoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };
      
      currentRow++;
    }

    // Настраиваем ширину столбцов
    worksheet.getColumn(1).width = 60;
    for (let i = 0; i < request.departmentIds.length; i++) {
      worksheet.getColumn(i + 2).width = 20;
    }
    // Итоговые столбцы
    worksheet.getColumn(totalGkCol).width = 20;
    worksheet.getColumn(totalPaoCol).width = 20;

    // Генерируем буфер
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  },

  /**
   * Данные таблицы отчётов по полям и департаментам с пагинацией
   */
  async getReportTable(request: TableRequest): Promise<{
    rows: Array<{ fieldName: string; fieldKey: string; [key: string]: string | number }>;
    departments: Array<{ id: number; name: string }>;
    total: number;
    paoMtsDepartmentIds: number[];
  }> {
    console.log('[reportService.getReportTable] Starting', { page: request.page, limit: request.limit, departmentIds: request.departmentIds });
    const { dateFrom, dateTo, departmentIds, page, limit } = request;
    
    console.log('[reportService.getReportTable] Fetching departments', { departmentIdsCount: departmentIds.length });
    const departments = departmentIds.length > 0
      ? await Department.findAll({ where: { department_id: { [Op.in]: departmentIds } } })
      : await Department.findAll();
    
    console.log('[reportService.getReportTable] Departments fetched:', departments.length, 'IDs:', departments.map(d => d.department_id));
    
    // Функция для получения всех потомков департамента
    console.log('[reportService.getReportTable] Fetching all departments');
    const allDepartments = await Department.findAll();
    console.log('[reportService.getReportTable] All departments fetched:', allDepartments.length);
    const getAllDescendants = (parentId: number): number[] => {
      const result = [parentId];
      const children = allDepartments.filter((d) => d.parent_id === parentId);
      for (const child of children) {
        result.push(...getAllDescendants(child.department_id));
      }
      return result;
    };
    
    // Определяем департаменты ПАО МТС (белый список)
    const paoMtsDepartmentNames = ['КЦ', 'Москва', 'Центр', 'СЗ', 'Поволжье', 'ЕЦКБ', 'Юг', 'Урал', 'Сибирь', 'ДВ'];
    const paoMtsIds = new Set<number>(); // Все ID включая потомков - для подсчета total_pao_mts
    const paoMtsMainIds: number[] = []; // Только основные департаменты - для фильтрации
    
    for (const name of paoMtsDepartmentNames) {
      const dept = allDepartments.find((d) => d.title === name);
      if (dept) {
        // Сохраняем основной департамент
        paoMtsMainIds.push(dept.department_id);
        // Добавляем департамент и всех его потомков для подсчета total_pao_mts
        getAllDescendants(dept.department_id).forEach(id => paoMtsIds.add(id));
      }
    }
    
    const total = REPORT_FIELDS.length;
    const start = (page - 1) * limit;
    const pageFields = REPORT_FIELDS.slice(start, start + limit);
    console.log('[reportService.getReportTable] Processing fields:', pageFields.length, 'from', start, 'to', start + limit);
    const rows: Array<{ fieldName: string; fieldKey: string; [key: string]: string | number }> = [];

    for (let i = 0; i < pageFields.length; i++) {
      const def = pageFields[i];
      console.log(`[reportService.getReportTable] Processing field ${i + 1}/${pageFields.length}: ${def.key}`);
      
      // Проверяем сигнал отмены перед обработкой каждого поля
      if (request.abortSignal?.aborted) {
        console.log(`[reportService.getReportTable] Abort signal detected, stopping computation at field ${def.key}`);
        throw new Error('Request aborted');
      }

      const row: { fieldName: string; fieldKey: string; [key: string]: string | number } = {
        fieldName: def.label,
        fieldKey: def.key,
      };
      
      let totalGkMts = 0;
      let totalPaoMts = 0;
      
      for (const dept of departments) {
        // Проверяем сигнал отмены перед обработкой каждого департамента
        if (request.abortSignal?.aborted) {
          console.log(`[reportService.getReportTable] Abort signal detected, stopping computation at dept ${dept.department_id}`);
          throw new Error('Request aborted');
        }

        // Получаем всех потомков текущего департамента (включая его самого)
        const deptWithDescendants = getAllDescendants(dept.department_id);
        
        // Суммируем значения для департамента и всех его потомков
        let deptValue = 0;
        for (const deptId of deptWithDescendants) {
          // Проверяем сигнал отмены перед каждым вычислением
          if (request.abortSignal?.aborted) {
            console.log(`[reportService.getReportTable] Abort signal detected, stopping computation at dept ${deptId}`);
            throw new Error('Request aborted');
          }
          const val = await computeFieldValueByRule(def, deptId, dateFrom, dateTo);
          deptValue += val;
        }
        
        row[`dept_${dept.department_id}`] = deptValue;
        
        totalGkMts += deptValue;
        // В ПАО МТС включаем только если департамент входит в белый список
        if (paoMtsIds.has(dept.department_id)) {
          totalPaoMts += deptValue;
        }
      }
      
      row.total_gk_mts = totalGkMts;
      row.total_pao_mts = totalPaoMts;
      
      rows.push(row);
      console.log(`[reportService.getReportTable] Field ${i + 1}/${pageFields.length} completed`);
    }

    console.log('[reportService.getReportTable] All fields processed, returning result');
    const result = {
      rows,
      departments: departments.map((d) => ({ id: d.department_id, name: d.title })),
      total,
      // Возвращаем только основные департаменты ПАО МТС (без потомков)
      // Потомки будут получены автоматически через getAllDescendants при фильтрации
      paoMtsDepartmentIds: paoMtsMainIds,
    };
    console.log('[reportService.getReportTable] Result prepared:', { rowsCount: rows.length, departmentsCount: result.departments.length });
    return result;
  },

  /**
   * Выгрузка выбранного разреза (поля + департаменты) в Excel
   */
  async exportSelectedReport(request: ExportRequest): Promise<ExcelJS.Buffer> {
    const { dateFrom, dateTo, departmentIds, fieldKeys } = request;
    const validKeys = fieldKeys.filter((k) => REPORT_FIELDS.some((f) => f.key === k));
    if (validKeys.length === 0) {
      throw new Error('Не найдено полей для выгрузки');
    }
    return this.generateReport({
      dateFrom,
      dateTo,
      departmentIds,
      fieldKeys: validKeys,
    });
  },
};
