import { useEffect } from "react";
import {
  CreateEventBody,
  EventWithRelations,
} from "../../../interfaces/requests/event";
import { Form } from "antd";
import dayjs from "dayjs";

export const useForm = ({
  event,
  createEvent,
  updateEvent,
}: {
  event: EventWithRelations | null | undefined;
  createEvent: (data: CreateEventBody) => void;
  updateEvent: ({
    data,
    id,
  }: {
    data: CreateEventBody;
    id: number;
  }) => void;
}) => {
  const [form] = Form.useForm<CreateEventBody>();

  useEffect(() => {
    if (event) {
      form.setFieldsValue({
        department_id: event.department_id,
        date: event.date ? dayjs(event.date) : undefined,
        is_service_investigation: event.is_service_investigation,
        is_service_check: event.is_service_check,
        is_service_check_ib: event.is_service_check_ib,
        is_verification_activity: event.is_verification_activity,
        quantity: event.quantity,
        description: event.description,
        detected_damage: event.detected_damage,
        recovered_damage: event.recovered_damage,
        prevented_damage: event.prevented_damage,
        additional_income: event.additional_income,
        reduced_cost: event.reduced_cost,
        prevented_unnecessary_writeoff: event.prevented_unnecessary_writeoff,
        vat_deducted: event.vat_deducted,
        criminal_case: event.criminal_case ? {
          ...event.criminal_case,
          transfer_date: event.criminal_case.transfer_date ? dayjs(event.criminal_case.transfer_date) : undefined,
          rejection_date: event.criminal_case.rejection_date ? dayjs(event.criminal_case.rejection_date) : undefined,
          appeal_date: event.criminal_case.appeal_date ? dayjs(event.criminal_case.appeal_date) : undefined,
          case_date: event.criminal_case.case_date ? dayjs(event.criminal_case.case_date) : undefined,
        } : undefined,
        punishment: event.punishment || undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_service_investigation: false,
        is_service_check: false,
        is_service_check_ib: false,
        is_verification_activity: false,
      });
    }
  }, [event, form]);

  const onFinish = () => {
    const formValues: CreateEventBody = form.getFieldsValue(true);

    const processedData: CreateEventBody = {
      department_id: formValues.department_id,
      date: formValues.date ? dayjs(formValues.date).toDate() : new Date(),
      is_service_investigation: Boolean(formValues.is_service_investigation),
      is_service_check: Boolean(formValues.is_service_check),
      is_service_check_ib: Boolean(formValues.is_service_check_ib),
      is_verification_activity: Boolean(formValues.is_verification_activity),
      quantity: formValues.quantity,
      description: formValues.description,
      detected_damage: formValues.detected_damage,
      recovered_damage: formValues.recovered_damage,
      prevented_damage: formValues.prevented_damage,
      additional_income: formValues.additional_income,
      reduced_cost: formValues.reduced_cost,
      prevented_unnecessary_writeoff: formValues.prevented_unnecessary_writeoff,
      vat_deducted: formValues.vat_deducted,
      criminal_case: formValues.criminal_case ? {
        ...formValues.criminal_case,
        transfer_date: formValues.criminal_case.transfer_date ? dayjs(formValues.criminal_case.transfer_date).toDate() : undefined,
        rejection_date: formValues.criminal_case.rejection_date ? dayjs(formValues.criminal_case.rejection_date).toDate() : undefined,
        appeal_date: formValues.criminal_case.appeal_date ? dayjs(formValues.criminal_case.appeal_date).toDate() : undefined,
        case_date: formValues.criminal_case.case_date ? dayjs(formValues.criminal_case.case_date).toDate() : undefined,
      } : undefined,
      punishment: formValues.punishment || undefined,
    };

    if (!event?.id) {
      createEvent(processedData);
    } else {
      updateEvent({
        data: processedData,
        id: event.id,
      });
    }
  };

  return { form, onFinish };
};
