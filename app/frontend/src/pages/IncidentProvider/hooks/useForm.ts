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

    if (isDuplicate || !incident?.id) {
              createIncident({
                department_id: formValues.department_id,
                direction: formValues.direction,
                object_type_id: formValues.object_type_id,
                message: formValues.message,
                is_db: formValues.is_db,
        events:
          formValues.events?.map((event) => ({
            ...event,
            date: event.date ? dayjs(event.date).toDate() : new Date(),
            entry_date: event.entry_date ? dayjs(event.entry_date).toDate() : undefined,
          })) ?? [],
        punishments:
          formValues.punishments?.map((punishment) => ({
            ...punishment,
            date: punishment.date
              ? dayjs(punishment.date).toDate()
              : new Date(),
          })) ?? [],
      });
    }

    if (incident?.id) {
              updateIncident({
                data: {
                  department_id: formValues.department_id,
                  direction: formValues.direction,
                  object_type_id: formValues.object_type_id,
                  message: formValues.message,
                  is_db: formValues.is_db,
          events:
            formValues.events?.map((event) => ({
              ...event,
              date: event.date ? dayjs(event.date).toDate() : new Date(),
              entry_date: event.entry_date ? dayjs(event.entry_date).toDate() : undefined,
            })) ?? [],
          punishments:
            formValues.punishments?.map((punishment) => ({
              ...punishment,
              date: punishment.date
                ? dayjs(punishment.date).toDate()
                : new Date(),
            })) ?? [],
        },
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
                message: incident.message,
                is_db: incident.is_db,
        events: incident.events?.map((event) => {
          const { event_type, createdAt, updatedAt, id, incident_id, ...rest } =
            event;

          console.log("Event:", {
            ...rest,
            date: rest.date ? dayjs(rest.date) : undefined,
            criminal_cases:
              rest.criminal_cases?.map((criminalCase) => {
                const { id, event_history_id, createdAt, updatedAt, ...rest } =
                  criminalCase;
                return {
                  ...rest,
                  appeal_date: rest.appeal_date
                    ? dayjs(rest.appeal_date)
                    : undefined,
                  transfer_date: rest.transfer_date
                    ? dayjs(rest.transfer_date)
                    : undefined,
                  case_date: rest.case_date ? dayjs(rest.case_date) : undefined,
                  review_result: rest.review_result
                    ? dayjs(rest.review_result)
                    : undefined,
                  rejection_date: rest.rejection_date
                    ? dayjs(rest.rejection_date)
                    : undefined,
                };
              }) ?? [],
          });
          return {
            ...rest,
            date: rest.date ? dayjs(rest.date) : undefined,
            entry_date: rest.entry_date ? dayjs(rest.entry_date) : dayjs(),
            criminal_cases:
              rest.criminal_cases?.map((criminalCase) => {
                const { id, event_history_id, createdAt, updatedAt, ...rest } =
                  criminalCase;
                return {
                  ...rest,
                  appeal_date: rest.appeal_date
                    ? dayjs(rest.appeal_date)
                    : undefined,
                  transfer_date: rest.transfer_date
                    ? dayjs(rest.transfer_date)
                    : undefined,
                  case_date: rest.case_date ? dayjs(rest.case_date) : undefined,
                  rejection_date: rest.rejection_date
                    ? dayjs(rest.rejection_date)
                    : undefined,
                };
              }) ?? [],
          };
        }),
        punishments:
          incident.punishments?.map((punishment) => {
            const { id, incident_id, createdAt, updatedAt, ...rest } =
              punishment;
            return {
              ...rest,
              date: rest.date ? dayjs(rest.date) : undefined,
            };
          }) ?? [],
      };

      form.setFieldsValue(formValues);
    }
  }, [incident]);

  return { form, onFinish };
};
