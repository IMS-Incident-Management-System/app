import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Incident, Event, OperationalActivity, Department } from '../models';

interface ReportField {
  entity: 'incident' | 'event' | 'operationalActivity';
  field: string;
  label: string;
}

interface ReportRequest {
  dateFrom: Date;
  dateTo: Date;
  departmentIds: number[];
  fields: ReportField[];
}

export const reportService = {
  /**
   * Генерация Excel отчета
   */
  async generateReport(request: ReportRequest): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчет');

    // Получаем названия департаментов
    const departments = await Department.findAll({
      where: {
        department_id: {
          [Op.in]: request.departmentIds
        }
      }
    });

    const departmentMap = new Map(
      departments.map(d => [d.department_id, d.title])
    );

    // Собираем данные для каждого поля
    const fieldData = new Map<string, Map<number, number>>();

    // Определяем булевы поля, которые нужно считать как количество
    const booleanFields = new Set([
      'is_service_investigation',
      'is_service_check',
      'is_service_check_ib',
      'is_verification_activity',
      'is_db'
    ]);

    // Собираем данные для всех полей
    for (const field of request.fields) {
      const dataMap = new Map<number, number>();
      const isBooleanField = booleanFields.has(field.field);
      
      for (const departmentId of request.departmentIds) {
        let value = 0;

        // Устанавливаем dateTo на конец дня для включения всех записей за этот день
        const dateToEndOfDay = new Date(request.dateTo);
        dateToEndOfDay.setHours(23, 59, 59, 999);

        if (field.entity === 'incident') {
          if (isBooleanField) {
            // Для булевых полей считаем количество записей где поле = true
            const count = await Incident.count({
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                },
                [field.field]: true
              } as any
            });
            value = count as number;
          } else {
            const result = await Incident.sum(field.field as any, {
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                }
              } as any
            });
            value = Number(result) || 0;
          }
        } else if (field.entity === 'event') {
          if (isBooleanField) {
            const count = await Event.count({
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                },
                [field.field]: true
              } as any
            });
            value = count as number;
          } else {
            const result = await Event.sum(field.field as any, {
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                }
              } as any
            });
            value = Number(result) || 0;
          }
        } else if (field.entity === 'operationalActivity') {
          if (isBooleanField) {
            const count = await OperationalActivity.count({
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                },
                [field.field]: true
              } as any
            });
            value = count as number;
          } else {
            const result = await OperationalActivity.sum(field.field as any, {
              where: {
                department_id: departmentId,
                createdAt: {
                  [Op.between]: [request.dateFrom, dateToEndOfDay]
                }
              } as any
            });
            value = Number(result) || 0;
          }
        }

        dataMap.set(departmentId, value);
      }

      fieldData.set(`${field.entity}.${field.field}`, dataMap);
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
    worksheet.mergeCells(1, 1, 1, 1 + request.departmentIds.length + 1);

    // Заголовки столбцов
    const headerRow = worksheet.getRow(2);
    headerRow.getCell(1).value = 'Показатель';
    headerRow.getCell(1).font = { bold: true };
    
    request.departmentIds.forEach((deptId, index) => {
      const deptName = departmentMap.get(deptId) || `Департамент ${deptId}`;
      headerRow.getCell(index + 2).value = deptName;
      headerRow.getCell(index + 2).font = { bold: true };
    });

    let currentRow = 3;

    // Строка с общей суммой всех полей
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'ИТОГО';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F5E9' } // светло-зеленый
    };

    request.departmentIds.forEach((deptId, index) => {
      let totalSum = 0;
      for (const field of request.fields) {
        const dataMap = fieldData.get(`${field.entity}.${field.field}`);
        if (dataMap) {
          totalSum += dataMap.get(deptId) || 0;
        }
      }
      const cell = totalRow.getCell(index + 2);
      cell.value = totalSum;
      cell.numFmt = '#,##0';
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E9' } // светло-зеленый
      };
    });

    currentRow++;

    // Выводим все поля
    for (const field of request.fields) {
      const dataRow = worksheet.getRow(currentRow);
      dataRow.getCell(1).value = field.label;

      request.departmentIds.forEach((deptId, index) => {
        const dataMap = fieldData.get(`${field.entity}.${field.field}`);
        const value = dataMap ? (dataMap.get(deptId) || 0) : 0;
        const cell = dataRow.getCell(index + 2);
        cell.value = value;
        cell.numFmt = '#,##0';
      });

      currentRow++;
    }

    // Настраиваем ширину столбцов
    worksheet.getColumn(1).width = 60;
    for (let i = 0; i < request.departmentIds.length; i++) {
      worksheet.getColumn(i + 2).width = 20;
    }

    // Генерируем буфер
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }
};
