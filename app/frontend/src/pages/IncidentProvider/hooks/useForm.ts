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
  createIncident,
  updateIncident,
}: {
  incident: IncidentWithRelations | null | undefined;
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
        const { id, ...additionallyWithoutId } = additionally;
        return {
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
        event: incident.events && incident.events.length > 0 ? {
          event_type_ids: incident.events.map(event => event.event_type_id),
          date: incident.events[0].date ? dayjs(incident.events[0].date) : undefined,
          entry_date: incident.events[0].entry_date ? dayjs(incident.events[0].entry_date) : dayjs(),
          sub_type_id: incident.events[0].sub_type_id,
        } : undefined,
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
  }, [incident, form]);

  return { form, onFinish };
};
