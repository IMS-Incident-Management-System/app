import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { SecurityDirectionEnum } from '../../models/incident';
import { incidentEventService } from '../../services/incidentEvent.service';
import { additionallyService } from '../../services/additionally.service';
import { incidentAddressService } from '../../services/incidentAddress.service';
import { incidentPersonService } from '../../services/incidentPerson.service';
import { additionallyPersonService } from '../../services/additionallyPerson.service';
import { criminalCaseService } from '../../services/criminalCase.service';
import { punishmentService } from '../../services/punishment.service';
import { sequelize } from '../../models/sequelize';
import { IncidentObjectType } from '../../models';

interface CreateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number; // Для обратной совместимости
  object_type_ids?: number[]; // Массив типов объектов для множественного выбора
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  event: {
    event_type_ids: number[];
    sub_type_id?: number;
    date: Date;
    entry_date?: Date;
  };
  addresses?: Array<{
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    apartment?: string;
  }>;
  persons?: Array<{
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    employee_number?: string;
  }>;
  additionally: Array<{
    id?: number; // ID записи (исключается при создании)
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
    criminal_case?: {
      transfer_date?: Date;
      document_number?: string;
      department_name?: string;
      review_result?: string;
      case_number?: string;
      law_article?: string;
      rejection_date?: Date;
      rejection_reason?: string;
      appeal_date?: Date;
      case_date?: Date;
      initiator?: string;
      subject?: string;
      detained_count?: number;
      person_name?: string;
      case_result?: string;
      court_decision?: string;
      convicted_count?: number;
    };
    punishment?: {
      guilty_persons_count?: number;
      measures_taken_count?: number;
      warning_letter_rp398?: number;
      remark?: number;
      reprimand?: number;
      dismissed_count?: number;
    };
    persons?: Array<{
      last_name?: string;
      first_name?: string;
      middle_name?: string;
      birth_date?: Date;
      employee_number?: string;
    }>;
  }>
}

export const createIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateIncidentBody;

    if (!data.department_id || !data.direction) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Создаем инцидент
      // Для обратной совместимости берем первый элемент из массива или object_type_id
      const object_type_id = data.object_type_ids && data.object_type_ids.length > 0
        ? data.object_type_ids[0]
        : data.object_type_id;

      const incident = await incidentService.createIncident(
        {
          department_id: data.department_id,
          direction: data.direction,
          object_type_id: object_type_id,
          is_db: Boolean(data.is_db),
          description: data.description,
          source_last_name: data.source_last_name,
          source_first_name: data.source_first_name,
          source_middle_name: data.source_middle_name,
          source_position: data.source_position,
        },
        { transaction }
      );

      // 1.1. Создаем связи many-to-many с типами объектов
      if (data.object_type_ids && data.object_type_ids.length > 0) {
        await Promise.all(
          data.object_type_ids.map((object_type_id) =>
            IncidentObjectType.create(
              {
                incident_id: incident.id,
                object_type_id: object_type_id,
              },
              { transaction }
            )
          )
        );
      } else if (data.object_type_id) {
        // Если передан старый формат, создаем одну связь
        await IncidentObjectType.create(
          {
            incident_id: incident.id,
            object_type_id: data.object_type_id,
          },
          { transaction }
        );
      }

      // 2. Создаем события для каждого типа события
      const events = await Promise.all(
        data.event.event_type_ids.map((event_type_id) =>
          incidentEventService.createIncidentEvent(
            {
              incident_id: incident.id,
              event_type_id: event_type_id,
              sub_type_id: data.event.sub_type_id,
              date: data.event.date,
              entry_date: data.event.entry_date,
            },
            { transaction }
          )
        )
      );

      // 3. Создаем адреса
      if (data.addresses && data.addresses.length > 0) {
        await incidentAddressService.createAddresses(
          data.addresses.map((address) => ({
            ...address,
            incident_id: incident.id,
          })),
          { transaction }
        );
      }

      // 4. Создаем персональные данные
      if (data.persons && data.persons.length > 0) {
        await incidentPersonService.createPersons(
          data.persons.map((person) => ({
            ...person,
            incident_id: incident.id,
          })),
          { transaction }
        );
      }

      if (data.additionally.length) {
        for (const additionallyData of data.additionally) {
          // Исключаем id и связанные данные
          const { id, criminal_case, punishment, persons, ...additionallyDataWithoutId } = additionallyData;
          
          // Создаем дополнение (addition_date проставляется автоматически)
          const { addition_date, ...additionallyDataWithoutDate } = additionallyDataWithoutId;
          const additionally = await additionallyService.createAdditionally(
            { 
              ...additionallyDataWithoutDate, 
              incident_id: incident.id,
              addition_date: new Date() // Всегда проставляем текущую дату автоматически
            },
            { transaction }
          );

          // Создаем фигурантов дополнения
          if (persons && persons.length > 0) {
            await additionallyPersonService.createPersons(
              persons.map((person) => ({
                ...person,
                additionally_id: additionally.id,
              })),
              { transaction }
            );
          }

          // Создаем уголовное дело (только одно)
          if (criminal_case) {
            const { id: criminalCaseId, ...criminalCaseWithoutId } = criminal_case as any;
            await criminalCaseService.createCriminalCase(
              { ...criminalCaseWithoutId, additionally_id: additionally.id },
              { transaction }
            );
          }

          // Создаем наказание
          if (punishment) {
            const { id: punishmentId, ...punishmentWithoutId } = punishment as any;
            await punishmentService.createPunishment(
              {
                ...punishmentWithoutId,
                additionally_id: additionally.id
              },
              { transaction }
            );
          }
        }
      }

      // 6. Собираем ответ
      return {
        incident,
        events,
        additionallys: data.additionally ?? [],
        addresses: data.addresses ?? [],
        persons: data.persons ?? [],
      };
    });

    res.created(result, 'Incident created successfully');
  }
);
