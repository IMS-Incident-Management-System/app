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
      object_type_id: formValues.object_type_id,
      is_db: formValues.is_db,
      description: formValues.description,
      source_last_name: formValues.source_last_name,
      source_first_name: formValues.source_first_name,
      source_middle_name: formValues.source_middle_name,
      source_position: formValues.source_position,
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
          incident_date: additionally.incident_date ? dayjs(additionally.incident_date).toDate() : undefined,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date).toDate() : undefined,
          criminal_cases_list: additionally.criminal_cases_list?.map((cc: CriminalCaseAttributes) => ({
            ...cc,
            transfer_date: cc.transfer_date ? dayjs(cc.transfer_date).toDate() : undefined,
          })) ?? [],
          punishments: additionally.punishments?.map((p: PunishmentAttributes) => ({
            ...p,
            date: p.date ? dayjs(p.date).toDate() : new Date(),
          })) ?? [],
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
      const formValues = {
        department_id: incident.department_id,
        direction: incident.direction,
        object_type_id: incident.object_type_id,
        is_db: incident.is_db,
        description: incident.description,
        source_last_name: incident.source_last_name,
        source_first_name: incident.source_first_name,
        source_middle_name: incident.source_middle_name,
        source_position: incident.source_position,
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
          incident_date: additionally.incident_date ? dayjs(additionally.incident_date) : undefined,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date) : undefined,
          criminal_cases_list: additionally.criminal_cases_list?.map((cc: CriminalCaseAttributes) => ({
            ...cc,
            transfer_date: cc.transfer_date ? dayjs(cc.transfer_date) : undefined,
          })) ?? [],
          punishments: additionally.punishments?.map((p: PunishmentAttributes) => ({
            ...p,
            date: p.date ? dayjs(p.date) : undefined,
          })) ?? [],
        })) ?? [],
      };

      form.setFieldsValue(formValues);
    }
  }, [incident]);

  return { form, onFinish };
};
