import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { IncidentWithRelations } from '../../interfaces/requests/incident';
import { EIncidentDirection } from '../../enums/incident';
import dayjs from 'dayjs';

export class ExportService {
  private static getDirectionText(direction: string): string {
    switch (direction) {
      case EIncidentDirection.INFORMATION:
        return "Информационная безопасность (ИБ)";
      case EIncidentDirection.ECONOMIC:
        return "Экономическая безопасность (ЭБ)";
      case EIncidentDirection.SECURITY:
        return "Безопасность персонала и объектов (БПиО)";
      case EIncidentDirection.CYBER:
        return "Кибербезопасность (КБ)";
      case EIncidentDirection.ANTIFRAUD:
        return "Антифрод";
      case EIncidentDirection.SORM:
        return "СОРМ";
      default:
        return direction;
    }
  }

  private static formatCurrency(amount?: number): string {
    if (!amount) return "Не указано";
    return `${amount.toLocaleString('ru-RU')} руб.`;
  }

  private static formatDate(date?: Date): string {
    if (!date) return "Не указано";
    return dayjs(date).format("DD.MM.YYYY");
  }

  private static formatDateTime(date?: Date): string {
    if (!date) return "Не указано";
    return dayjs(date).format("DD.MM.YYYY HH:mm");
  }

  // PDF Export
  static async exportToPDF(incident: IncidentWithRelations): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Используем встроенный шрифт для поддержки русского языка
    doc.setFont('helvetica');

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Заголовок
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ИНЦИДЕНТ БЕЗОПАСНОСТИ', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`№ ${incident.id}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Основная информация
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ОСНОВНАЯ ИНФОРМАЦИЯ', margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    const basicInfo = [
      ['ID инцидента:', `#${incident.id}`],
      ['Дата создания:', this.formatDateTime(incident.createdAt)],
      ['Подразделение:', incident.department?.title || 'Не указано'],
      ['Направление:', this.getDirectionText(incident.direction)],
      ['Тип объекта:', 
        incident.object_types && incident.object_types.length > 0
          ? incident.object_types.map((ot) => ot.title).join(', ')
          : incident.object_type?.title || (incident.object_type_id ? `ID: ${incident.object_type_id}` : 'Не указан')
      ],
      ['Дело безопасности:', incident.is_db ? 'Да (1-ДБ)' : 'Нет']
    ];

    basicInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 60, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Информация о событиях
    if (incident.events && incident.events.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('ИНФОРМАЦИЯ О СОБЫТИЯХ', margin, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      // Типы событий
      doc.text('Типы событий:', margin, yPosition);
      yPosition += 6;
      incident.events.forEach((event, index) => {
        doc.text(`• ${event.event_type?.title || 'Не указано'}`, margin + 10, yPosition);
        yPosition += 6;
      });
      yPosition += 5;

      const eventInfo = [
        ['Дата события:', this.formatDate(incident.events[0].date)],
        ['Дата внесения:', this.formatDate(incident.events[0].entry_date)],
        ['Описание:', incident.events[0].description || 'Не указано']
      ];

      eventInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        
        // Перенос строк для длинного текста
        const lines = doc.splitTextToSize(value, contentWidth - 60);
        doc.text(lines, margin + 60, yPosition);
        yPosition += lines.length * 5 + 2;
      });

      yPosition += 5;

      // Адрес
      if (incident.events[0].city || incident.events[0].street || incident.events[0].house || incident.events[0].building || incident.events[0].apartment) {
        doc.setFont('helvetica', 'bold');
        doc.text('АДРЕС', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        const addressParts = [];
        if (incident.events[0].city) addressParts.push(`Город: ${incident.events[0].city}`);
        if (incident.events[0].street) addressParts.push(`Улица: ${incident.events[0].street}`);
        if (incident.events[0].house) addressParts.push(`Дом: ${incident.events[0].house}`);
        if (incident.events[0].building) addressParts.push(`Корпус: ${incident.events[0].building}`);
        if (incident.events[0].apartment) addressParts.push(`Квартира: ${incident.events[0].apartment}`);

        addressParts.forEach(part => {
          doc.text(part, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      // ФИО
      if (incident.events[0].last_name || incident.events[0].first_name || incident.events[0].middle_name || incident.events[0].employee_number) {
        doc.setFont('helvetica', 'bold');
        doc.text('ФИО', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        const personalData = [];
        if (incident.events[0].last_name) personalData.push(`Фамилия: ${incident.events[0].last_name}`);
        if (incident.events[0].first_name) personalData.push(`Имя: ${incident.events[0].first_name}`);
        if (incident.events[0].middle_name) personalData.push(`Отчество: ${incident.events[0].middle_name}`);
        if (incident.events[0].employee_number) personalData.push(`Табельный номер: ${incident.events[0].employee_number}`);

        personalData.forEach(data => {
          doc.text(data, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
    }

    // Дополнительная информация
    if (incident.additionally && incident.additionally.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ', margin, yPosition);
      yPosition += 10;

      incident.additionally.forEach((addition, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Дополнение #${index + 1}`, margin, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        const additionInfo = [
          ['Дата внесения дополнения:', this.formatDate(addition.addition_date)],
          ['Описание:', addition.text_field || 'Не указано'],
          ['Выявленный ущерб:', this.formatCurrency(addition.detected_damage)],
          ['Предотвращенный ущерб:', this.formatCurrency(addition.prevented_damage)],
          ['Возмещенный ущерб:', this.formatCurrency(addition.recovered_damage)]
        ];

        additionInfo.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          
          const lines = doc.splitTextToSize(value, contentWidth - 60);
          doc.text(lines, margin + 60, yPosition);
          yPosition += lines.length * 5 + 2;
        });

        yPosition += 10;
      });
    }

    // Подпись и дата
    yPosition += 20;
    doc.setFont('helvetica', 'normal');
    doc.text(`Документ сформирован: ${this.formatDateTime(new Date())}`, margin, yPosition);
    doc.text('Система управления инцидентами безопасности', pageWidth / 2, yPosition + 10, { align: 'center' });

    // Сохранение файла
    const fileName = `incident_${incident.id}_${dayjs().format('YYYY-MM-DD')}.pdf`;
    doc.save(fileName);
  }

  // DOCX Export
  static async exportToDOCX(incident: IncidentWithRelations): Promise<void> {
    console.log('Создаем DOCX документ для инцидента:', incident.id);
    
    try {
      // Создаем упрощенный документ для тестирования
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Заголовок
            new Paragraph({
              children: [
                new TextRun({
                  text: "ИНЦИДЕНТ БЕЗОПАСНОСТИ",
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `№ ${incident.id}`,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),

            // Основная информация
            new Paragraph({
              children: [
                new TextRun({
                  text: "ОСНОВНАЯ ИНФОРМАЦИЯ",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 300 },
            }),

            // Простые параграфы вместо таблиц
            new Paragraph({
              children: [
                new TextRun({ text: "ID инцидента: ", bold: true }),
                new TextRun({ text: `#${incident.id}` }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Дата создания: ", bold: true }),
                new TextRun({ text: this.formatDateTime(incident.createdAt) }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Подразделение: ", bold: true }),
                new TextRun({ text: incident.department?.title || 'Не указано' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Направление: ", bold: true }),
                new TextRun({ text: this.getDirectionText(incident.direction) }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Типы объектов: ", bold: true }),
                new TextRun({ 
                  text: incident.object_types && incident.object_types.length > 0
                    ? incident.object_types.map((ot) => ot.title).join(', ')
                    : incident.object_type?.title || (incident.object_type_id ? `ID: ${incident.object_type_id}` : 'Не указан')
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Дело безопасности: ", bold: true }),
                new TextRun({ text: incident.is_db ? 'Да (1-ДБ)' : 'Нет' }),
              ],
              spacing: { after: 400 },
            }),

            // Информация о событиях
            ...(incident.events && incident.events.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ИНФОРМАЦИЯ О СОБЫТИЯХ",
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { after: 300 },
              }),

              new Paragraph({
                children: [
                  new TextRun({ text: "Типы событий: ", bold: true }),
                ],
                spacing: { after: 200 },
              }),

              ...incident.events.map((event, index) => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `• ${event.event_type?.title || 'Не указано'}` }),
                  ],
                  spacing: { after: 100 },
                })
              ),

              new Paragraph({
                children: [
                  new TextRun({ text: "Дата события: ", bold: true }),
                  new TextRun({ text: this.formatDate(incident.events[0].date) }),
                ],
                spacing: { after: 200 },
              }),

              ...(incident.events[0].entry_date ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Дата внесения: ", bold: true }),
                    new TextRun({ text: this.formatDate(incident.events[0].entry_date) }),
                  ],
                  spacing: { after: 200 },
                }),
              ] : []),

              ...(incident.events[0].description ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Описание: ", bold: true }),
                    new TextRun({ text: incident.events[0].description }),
                  ],
                  spacing: { after: 200 },
                }),
              ] : []),

              new Paragraph({ spacing: { after: 400 } }),
            ] : []),

            // Подпись
            new Paragraph({
              children: [
                new TextRun({
                  text: `Документ сформирован: ${this.formatDateTime(new Date())}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Система управления инцидентами безопасности",
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      // Генерация и сохранение файла
      console.log('Генерируем blob для DOCX...');
      const blob = await Packer.toBlob(doc);
      console.log('Blob создан, размер:', blob.size);
      
      const fileName = `incident_${incident.id}_${dayjs().format('YYYY-MM-DD')}.docx`;
      console.log('Сохраняем файл:', fileName);
      saveAs(blob, fileName);
      console.log('Файл сохранен успешно');
    } catch (error) {
      console.error('Ошибка в exportToDOCX:', error);
      throw error;
    }
  }
}
