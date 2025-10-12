import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentService } from '../../services/incident.service';
import { eventHistoryService } from '../../services/eventHistory.service';
import { additionallyService } from '../../services/additionally.service';
import { incidentAddressService } from '../../services/incidentAddress.service';
import { incidentPersonService } from '../../services/incidentPerson.service';
import { criminalCaseService } from '../../services/criminalCase.service';
import { punishmentService } from '../../services/punishment.service';
import { sequelize } from '../../models';
import { SecurityDirectionEnum } from '../../models/incident';

interface UpdateIncidentBody {
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
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
  }>;
  persons?: Array<{
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    employee_number?: string;
  }>;
  additionally: Array<{
    incident_date?: Date; // Дата происшествия
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
    criminal_cases_list?: Array<{
      transfer_date?: Date;
      document_number?: string;
      department_name?: string;
      review_result?: string;
      case_number?: string;
      law_article?: string;
    }>;
    punishments?: Array<{
      punishment_type_id: number;
      description?: string;
      date: Date;
      fired_count: number;
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

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Обновляем инцидент
      const incident = await incidentService.updateIncident(
        Number(id),
        {
          department_id: data.department_id,
          direction: data.direction,
          object_type_id: data.object_type_id,
          is_db: Boolean(data.is_db),
          description: data.description,
          source_last_name: data.source_last_name,
          source_first_name: data.source_first_name,
          source_middle_name: data.source_middle_name,
          source_position: data.source_position,
        },
        { transaction }
      );

      if (!incident) {
        throw ApiError.notFound('Incident not found');
      }

      // 2. Удаляем старые события и создаем новое
      // Удаляем все события для этого инцидента
      const deletedEventsCount = await eventHistoryService.deleteEventsByIncidentId(Number(id), { transaction });
      console.log(`Deleted ${deletedEventsCount} old events for incident ${id}`);
      
      // Создаем события для каждого типа события
      const events = await Promise.all(
        data.event.event_type_ids.map((event_type_id) =>
          eventHistoryService.createEvent(
            {
              incident_id: Number(id),
              event_type_id: event_type_id,
              sub_type_id: data.event.sub_type_id,
              date: data.event.date,
              entry_date: data.event.entry_date,
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

      // 5. Удаляем старые additionally и создаем новые
      await additionallyService.deleteAdditionallyByIncidentId(Number(id), { transaction });
      
      if (data.additionally.length) {
        for (const additionallyData of data.additionally) {
          const { criminal_cases_list, punishments, ...additionallyDataWithout} = additionallyData;
          
          // Создаем дополнение
          const additionally = await additionallyService.createAdditionally(
            { ...additionallyDataWithout, incident_id: Number(id) },
            { transaction }
          );

          // Создаем уголовные дела
          if (criminal_cases_list && criminal_cases_list.length > 0) {
            await criminalCaseService.createCriminalCases(
              criminal_cases_list.map(cc => ({
                ...cc,
                additionally_id: additionally.id
              })),
              { transaction }
            );
          }

          // Создаем наказания
          if (punishments && punishments.length > 0) {
            await punishmentService.createPunishments(
              punishments.map(p => ({
                ...p,
                additionally_id: additionally.id
              })),
              { transaction }
            );
          }
        }
      }

      return {
        incident,
        events,
        additionallys: data.additionally ?? [],
        addresses: data.addresses ?? [],
        persons: data.persons ?? [],
      };
    });

    res.success(result, 'Incident updated successfully');
  }
);
