import React, { useEffect } from "react";
import {
  CreateIncidentBody,
  IncidentWithRelations,
  CriminalCaseAttributes,
  PunishmentAttributes,
} from "../../../interfaces/requests/incident";
import { Form } from "antd";
import dayjs from "dayjs";

export const useForm = ({
  incident,
  isLoading,
  createIncident,
  updateIncident,
}: {
  incident: IncidentWithRelations | null | undefined;
  isLoading?: boolean;
  createIncident: (data: CreateIncidentBody) => void;
  updateIncident: ({
    data,
    id,
  }: {
    data: CreateIncidentBody;
    id: number;
  }) => void;
}) => {
  const [form] = Form.useForm<CreateIncidentBody>();

  const onFinish = () => {
    const formValues: CreateIncidentBody = form.getFieldsValue(true);

    const processedData = {
      department_id: formValues.department_id,
      direction: formValues.direction,
      object_type_id: formValues.object_type_ids && formValues.object_type_ids.length > 0 
        ? formValues.object_type_ids[0] // Для обратной совместимости берем первый элемент
        : formValues.object_type_id,
      object_type_ids: formValues.object_type_ids || [],
      is_db: formValues.is_db,
      description: formValues.description,
      source_last_name: formValues.source_last_name,
      source_first_name: formValues.source_first_name,
      source_middle_name: formValues.source_middle_name,
      source_position: formValues.source_position,
      detected_damage: formValues.detected_damage,
      recovered_damage: formValues.recovered_damage,
      prevented_damage: formValues.prevented_damage,
      additional_income: formValues.additional_income,
      reduced_cost: formValues.reduced_cost,
      event: {
        ...formValues.event,
        event_type_ids: formValues.event?.event_type_ids || [],
        date: formValues.event?.date ? dayjs(formValues.event.date).toDate() : new Date(),
        entry_date: formValues.event?.entry_date ? dayjs(formValues.event.entry_date).toDate() : undefined,
      },
      addresses: formValues.addresses?.map((address) => {
        const { id, ...addressWithoutId } = address;
        return addressWithoutId;
      }) ?? [],
      persons: formValues.persons?.map((person) => {
        const { id, ...personWithoutId } = person;
        return personWithoutId;
      }) ?? [],
      additionally: formValues.additionally?.map((additionally) => {
        // Сохраняем id для связи со старыми событиями при обновлении
        const { id, ...additionallyWithoutId } = additionally;
        return {
          id, // Сохраняем id для переиспользования событий
          ...additionallyWithoutId,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date).toDate() : undefined,
          persons: additionally.persons?.map((person) => {
            const { id, ...personWithoutId } = person;
            return {
              ...personWithoutId,
              birth_date: person.birth_date ? dayjs(person.birth_date).toDate() : undefined,
            };
          }) ?? [],
          criminal_case: additionally.criminal_case ? {
            ...additionally.criminal_case,
            transfer_date: additionally.criminal_case.transfer_date ? dayjs(additionally.criminal_case.transfer_date).toDate() : undefined,
            rejection_date: additionally.criminal_case.rejection_date ? dayjs(additionally.criminal_case.rejection_date).toDate() : undefined,
            appeal_date: additionally.criminal_case.appeal_date ? dayjs(additionally.criminal_case.appeal_date).toDate() : undefined,
            case_date: additionally.criminal_case.case_date ? dayjs(additionally.criminal_case.case_date).toDate() : undefined,
          } : undefined,
          punishment: additionally.punishment ? {
            ...additionally.punishment,
          } : undefined,
        };
      }) ?? [],
    };

    if (!incident?.id) {
      // Создаем новый инцидент
      createIncident(processedData);
    } else {
      // Обновляем существующий инцидент
      updateIncident({
        data: processedData,
        id: incident.id,
      });
    }
  };

  useEffect(() => {
    // Не обновляем форму, если данные загружаются (избегаем сброса формы при рефетче)
    if (isLoading) {
      return;
    }
    
    if (incident) {
      // Определяем массив типов объектов: из object_types или из object_type (для обратной совместимости)
      const object_type_ids = incident.object_types && incident.object_types.length > 0
        ? incident.object_types.map((ot) => ot.object_type_id)
        : incident.object_type_id
        ? [incident.object_type_id]
        : [];

      const formValues = {
        department_id: incident.department_id,
        direction: incident.direction,
        object_type_id: incident.object_type_id,
        object_type_ids: object_type_ids,
        is_db: incident.is_db,
        description: incident.description,
        source_last_name: incident.source_last_name,
        source_first_name: incident.source_first_name,
        source_middle_name: incident.source_middle_name,
        source_position: incident.source_position,
        detected_damage: incident.detected_damage,
        recovered_damage: incident.recovered_damage,
        prevented_damage: incident.prevented_damage,
        additional_income: incident.additional_income,
        reduced_cost: incident.reduced_cost,
        event: (() => {
          if (!incident.events || incident.events.length === 0) {
            return undefined;
          }
          // Все уникальные типы из всех событий (и основных, и дополнений), чтобы тип инцидента можно было менять при наличии дополнений
          const mainEventTypeIds = Array.from(
            new Set(
              incident.events
                .map((e) => e.event_type_id)
                .filter((id): id is number => id !== null && id !== undefined),
            ),
          );
          return {
            event_type_ids: mainEventTypeIds,
            date: incident.events[0].date ? dayjs(incident.events[0].date) : undefined,
            entry_date: incident.events[0].entry_date ? dayjs(incident.events[0].entry_date) : dayjs(),
            sub_type_id: incident.events[0].sub_type_id,
          };
        })(),
        addresses: incident.addresses?.map((address) => ({
          ...address,
        })) ?? [],
        persons: incident.persons?.map((person) => ({
          ...person,
        })) ?? [],
        additionally: incident.additionally?.map((additionally) => ({
          ...additionally,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date) : undefined,
          persons: additionally.persons?.map((person) => ({
            ...person,
            birth_date: person.birth_date ? dayjs(person.birth_date) : undefined,
          })) ?? [],
          criminal_case: additionally.criminal_case ? {
            ...additionally.criminal_case,
            transfer_date: additionally.criminal_case.transfer_date ? dayjs(additionally.criminal_case.transfer_date) : undefined,
            rejection_date: additionally.criminal_case.rejection_date ? dayjs(additionally.criminal_case.rejection_date) : undefined,
            appeal_date: additionally.criminal_case.appeal_date ? dayjs(additionally.criminal_case.appeal_date) : undefined,
            case_date: additionally.criminal_case.case_date ? dayjs(additionally.criminal_case.case_date) : undefined,
          } : undefined,
          punishment: additionally.punishment ? {
            ...additionally.punishment,
          } : undefined,
        })) ?? [],
      };

      form.setFieldsValue(formValues);
    } else {
      // При создании нового инцидента устанавливаем значения по умолчанию
      form.setFieldsValue({
        is_db: false,
      });
    }
  }, [incident, isLoading, form]);

  return { form, onFinish };
};
