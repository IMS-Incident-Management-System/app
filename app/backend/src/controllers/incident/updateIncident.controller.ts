import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { incidentEventService } from '../../services/incidentEvent.service';
import { additionallyService } from '../../services/additionally.service';
import { incidentAddressService } from '../../services/incidentAddress.service';
import { incidentPersonService } from '../../services/incidentPerson.service';
import { additionallyPersonService } from '../../services/additionallyPerson.service';
import { criminalCaseService } from '../../services/criminalCase.service';
import { punishmentService } from '../../services/punishment.service';
import { sequelize } from '../../models';
import { SecurityDirectionEnum } from '../../models/incident';
import { IncidentObjectType } from '../../models';

interface UpdateIncidentBody {
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
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
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
    outcome_type?: 'injury' | 'fatal';
  }>;
  additionally: Array<{
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
    additional_income?: number; // Получен дополнительный доход (руб.)
    reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
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
      employees_involved_count?: number;
      detained_persons_count?: number;
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

export const updateIncident = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;
    const data = req.body as UpdateIncidentBody;
    
    
    if (!data.department_id || !data.direction) {
      throw ApiError.badRequest('Missing required fields');
    }
    if (!data.event || !Array.isArray(data.event.event_type_ids)) {
      throw ApiError.badRequest('Отсутствует блок event или event_type_ids');
    }
    const eventTypeIds = (data.event.event_type_ids as number[]).filter((id) => id != null);
    if (eventTypeIds.length === 0) {
      throw ApiError.badRequest('Укажите хотя бы один тип инцидента');
    }
    const additionallyList = Array.isArray(data.additionally) ? data.additionally : [];

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Обновляем инцидент
      // Для обратной совместимости берем первый элемент из массива или object_type_id
      const object_type_id = data.object_type_ids && data.object_type_ids.length > 0
        ? data.object_type_ids[0]
        : data.object_type_id;

      const incident = await incidentService.updateIncident(
        Number(id),
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
          detected_damage: data.detected_damage,
          recovered_damage: data.recovered_damage,
          prevented_damage: data.prevented_damage,
          additional_income: data.additional_income,
          reduced_cost: data.reduced_cost,
        },
        { transaction }
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      // 1.1. Удаляем старые связи с типами объектов и создаем новые
      await IncidentObjectType.destroy({
        where: { incident_id: Number(id) },
        transaction
      });

      if (data.object_type_ids && data.object_type_ids.length > 0) {
        await Promise.all(
          data.object_type_ids.map((object_type_id) =>
            IncidentObjectType.create(
              {
                incident_id: Number(id),
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
            incident_id: Number(id),
            object_type_id: data.object_type_id,
          },
          { transaction }
        );
      }

      // 2. Сохраняем информацию о существующих дополнениях и их событиях перед удалением
      const existingAdditionallyBeforeDelete = await sequelize.models.additionally.findAll({
        where: { incident_id: Number(id) },
        transaction
      });
      
      // Создаем мапу: old_additionally_id -> incident_event_id для сохранения событий с вложениями
      const existingEventIdMap = new Map<number, number>();
      existingAdditionallyBeforeDelete.forEach((add: any) => {
        if (add.id && add.incident_event_id) {
          existingEventIdMap.set(add.id, add.incident_event_id);
          console.log(`Mapped addition ID ${add.id} to event ID ${add.incident_event_id}`);
        }
      });
      console.log(`Created event ID map with ${existingEventIdMap.size} entries`);
      
      // Получаем существующие события перед удалением
      const existingEvents = await incidentEventService.getIncidentEvents({ incident_id: Number(id) });
      
      // Удаляем только основные события (не связанные с дополнениями через additionally)
      const eventsToDelete = existingEvents.filter((e: any) => {
        return !existingAdditionallyBeforeDelete.some((add: any) => add.incident_event_id === e.id);
      });
      
      // Удаляем основные события
      for (const event of eventsToDelete) {
        await incidentEventService.deleteIncidentEvent(event.id, { transaction });
      }
      console.log(`Deleted ${eventsToDelete.length} main events for incident ${id}`);
      
      // Создаем события для каждого типа события (только основные события)
      const events = await Promise.all(
        eventTypeIds.map((event_type_id) =>
          incidentEventService.createIncidentEvent(
            {
              incident_id: Number(id),
              event_type_id: event_type_id,
              sub_type_id: data.event!.sub_type_id,
              date: data.event!.date,
              entry_date: data.event!.entry_date,
            },
            { transaction }
          )
        )
      );

      // 3. Удаляем старые адреса и создаем новые
      await incidentAddressService.deleteAddressesByIncidentId(Number(id), { transaction });
      if (data.addresses && data.addresses.length > 0) {
        await incidentAddressService.createAddresses(
          data.addresses.map((address) => ({
            ...address,
            incident_id: Number(id),
          })),
          { transaction }
        );
      }

      // 4. Удаляем старые персональные данные и создаем новые
      await incidentPersonService.deletePersonsByIncidentId(Number(id), { transaction });
      if (data.persons && data.persons.length > 0) {
        await incidentPersonService.createPersons(
          data.persons.map((person) => ({
            ...person,
            incident_id: Number(id),
          })),
          { transaction }
        );
      }

      // 5. Удаляем старые дополнения (события остаются благодаря ON DELETE SET NULL в миграции 024)
      // (existingEventIdMap уже создана выше, содержит мапу old_additionally_id -> incident_event_id)
      await additionallyService.deleteAdditionallyByIncidentId(Number(id), { transaction });

      if (additionallyList.length > 0) {
        for (const additionallyData of additionallyList) {
          const { id: additionallyId, criminal_case, punishment, persons, ...additionallyDataWithout} = additionallyData as any;
          
          // Проверяем, есть ли существующее событие для этого дополнения по старому ID
          let additionEvent;
          const existingEventId = additionallyId ? existingEventIdMap.get(additionallyId) : undefined;
          
          if (existingEventId) {
            // Используем существующее событие (сохраняем вложения)
            additionEvent = await incidentEventService.getIncidentEvent(existingEventId);
            console.log(`Reusing existing event ${existingEventId} for addition ID ${additionallyId}`);
            if (!additionEvent) {
              console.log(`Event ${existingEventId} not found, creating new event`);
              // Если события нет, создаем новое
              const event_type_id = eventTypeIds.length > 0 ? eventTypeIds[0] : null;
              additionEvent = await incidentEventService.createIncidentEvent(
                {
                  incident_id: Number(id),
                  event_type_id: event_type_id,
                  date: data.event!.date,
                  entry_date: additionallyData.addition_date || new Date(),
                },
                { transaction }
              );
            }
          } else {
            // Создаем новое событие для дополнения
            console.log(`Creating new event for addition ID ${additionallyId || 'new'}`);
            const event_type_id = eventTypeIds.length > 0 ? eventTypeIds[0] : null;
            additionEvent = await incidentEventService.createIncidentEvent(
              {
                incident_id: Number(id),
                event_type_id: event_type_id,
                date: data.event!.date,
                entry_date: additionallyData.addition_date || new Date(),
              },
              { transaction }
            );
          }
          
          // Создаем дополнение (addition_date проставляется автоматически)
          const { addition_date, ...additionallyDataWithoutDate } = additionallyDataWithout;
          const additionally = await additionallyService.createAdditionally(
            { 
              ...additionallyDataWithoutDate, 
              incident_id: Number(id),
              incident_event_id: additionEvent.id,
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

      return {
        incident,
        events,
        additionallys: additionallyList,
        addresses: data.addresses ?? [],
        persons: data.persons ?? [],
      };
    });

    // Загружаем полные данные инцидента с attachments после завершения транзакции
    const fullIncident = await incidentService.getIncident(Number(id));
    
    res.success({
      ...result,
      incident: fullIncident,
    }, 'Incident updated successfully');
  }
);
