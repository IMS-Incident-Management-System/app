import React, { useEffect } from "react";
import {
  CreateIncidentBody,
  IncidentWithRelations,
} from "../../../interfaces/requests/incident";
import { Form } from "antd";
import dayjs from "dayjs";

export const useForm = ({
  incident,
  createIncident,
  updateIncident,
  isDuplicate,
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
  isDuplicate: boolean;
}) => {
  const [form] = Form.useForm<CreateIncidentBody>();

  const onFinish = () => {
    const formValues: CreateIncidentBody = form.getFieldsValue(true);

    const processedData = {
      department_id: formValues.department_id,
      direction: formValues.direction,
      object_type_id: formValues.object_type_id,
      is_db: formValues.is_db,
      event: {
        ...formValues.event,
        event_type_ids: formValues.event?.event_type_ids || [],
        date: formValues.event?.date ? dayjs(formValues.event.date).toDate() : new Date(),
        entry_date: formValues.event?.entry_date ? dayjs(formValues.event.entry_date).toDate() : undefined,
      },
      additionally: formValues.additionally?.map((additionally) => {
        // При дублировании исключаем id из данных
        const { id, ...additionallyWithoutId } = additionally;
        return {
          ...additionallyWithoutId,
          incident_date: additionally.incident_date ? dayjs(additionally.incident_date).toDate() : undefined,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date).toDate() : undefined,
        };
      }) ?? [],
    };

    if (isDuplicate || !incident?.id) {
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
        event: incident.events && incident.events.length > 0 ? {
          event_type_ids: incident.events.map(event => event.event_type_id),
          date: incident.events[0].date ? dayjs(incident.events[0].date) : undefined,
          entry_date: incident.events[0].entry_date ? dayjs(incident.events[0].entry_date) : dayjs(),
          // Берем данные из первого события (они должны быть одинаковыми для всех событий)
          sub_type_id: incident.events[0].sub_type_id,
          city: incident.events[0].city,
          street: incident.events[0].street,
          house: incident.events[0].house,
          building: incident.events[0].building,
          last_name: incident.events[0].last_name,
          first_name: incident.events[0].first_name,
          middle_name: incident.events[0].middle_name,
          employee_number: incident.events[0].employee_number,
        } : undefined,
        additionally: incident.additionally?.map((additionally) => ({
          ...additionally,
          incident_date: additionally.incident_date ? dayjs(additionally.incident_date) : undefined,
          addition_date: additionally.addition_date ? dayjs(additionally.addition_date) : undefined,
        })) ?? [],
      };

      form.setFieldsValue(formValues);
    }
  }, [incident]);

  return { form, onFinish };
};
