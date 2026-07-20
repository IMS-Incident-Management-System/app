import { useEffect } from "react";
import {
  CreateEventBody,
  EventWithRelations,
} from "../../../interfaces/requests/event";
import { Form } from "antd";
import dayjs from "dayjs";
import { toDateOnlyString, toDayjsDate } from "../../../utils/dateOnly";

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
      let eventType = "";
      if (event.is_service_investigation) eventType = "is_service_investigation";
      else if (event.is_service_investigation_ib) eventType = "is_service_investigation_ib";
      else if (event.is_service_investigation_bpio) eventType = "is_service_investigation_bpio";
      else if (event.is_service_investigation_bpio_hotline)
        eventType = "is_service_investigation_bpio_hotline";
      else if (event.is_service_check) eventType = "is_service_check";
      else if (event.is_service_check_ib) eventType = "is_service_check_ib";
      else if (event.is_service_check_bpio) eventType = "is_service_check_bpio";
      else if (event.is_service_check_bpio_hotline) eventType = "is_service_check_bpio_hotline";
      else if (event.is_verification_activity) eventType = "is_verification_activity";

      form.setFieldsValue({
        department_id: event.department_id,
        date: toDayjsDate(event.date) as any,
        entry_date: (toDayjsDate(event.entry_date) ?? dayjs()) as any,
        event_type: eventType,
        is_service_investigation: event.is_service_investigation,
        is_service_investigation_ib: event.is_service_investigation_ib,
        is_service_investigation_bpio: event.is_service_investigation_bpio,
        is_service_investigation_bpio_hotline: event.is_service_investigation_bpio_hotline,
        is_service_check: event.is_service_check,
        is_service_check_ib: event.is_service_check_ib,
        is_service_check_bpio: event.is_service_check_bpio,
        is_service_check_bpio_hotline: event.is_service_check_bpio_hotline,
        is_verification_activity: event.is_verification_activity,
        is_db: event.is_db,
        description: event.description,
        detected_damage: event.detected_damage,
        recovered_damage: event.recovered_damage,
        prevented_damage: event.prevented_damage,
        additional_income: event.additional_income,
        reduced_cost: event.reduced_cost,
        prevented_unnecessary_writeoff: event.prevented_unnecessary_writeoff,
        vat_deducted: event.vat_deducted,
        criminal_case: event.criminal_case
          ? {
              ...event.criminal_case,
              transfer_date: toDayjsDate(event.criminal_case.transfer_date) as any,
              rejection_date: toDayjsDate(event.criminal_case.rejection_date) as any,
              appeal_date: toDayjsDate(event.criminal_case.appeal_date) as any,
              case_date: toDayjsDate(event.criminal_case.case_date) as any,
            }
          : undefined,
        punishment: event.punishment || undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_service_investigation: false,
        is_service_investigation_ib: false,
        is_service_investigation_bpio: false,
        is_service_investigation_bpio_hotline: false,
        is_service_check: false,
        is_service_check_ib: false,
        is_service_check_bpio: false,
        is_service_check_bpio_hotline: false,
        is_verification_activity: false,
        is_db: false,
        entry_date: dayjs() as any,
      });
    }
  }, [event, form]);

  const onFinish = () => {
    const formValues: CreateEventBody = form.getFieldsValue(true);

    const eventType = formValues.event_type || "";
    const is_service_investigation = eventType === "is_service_investigation";
    const is_service_investigation_ib = eventType === "is_service_investigation_ib";
    const is_service_investigation_bpio = eventType === "is_service_investigation_bpio";
    const is_service_investigation_bpio_hotline =
      eventType === "is_service_investigation_bpio_hotline";
    const is_service_check = eventType === "is_service_check";
    const is_service_check_ib = eventType === "is_service_check_ib";
    const is_service_check_bpio = eventType === "is_service_check_bpio";
    const is_service_check_bpio_hotline = eventType === "is_service_check_bpio_hotline";
    const is_verification_activity = eventType === "is_verification_activity";

    const processedData: CreateEventBody = {
      department_id: formValues.department_id,
      date: toDateOnlyString(formValues.date as any, true) as any,
      entry_date: toDateOnlyString(formValues.entry_date as any, true) as any,
      is_service_investigation,
      is_service_investigation_ib,
      is_service_investigation_bpio,
      is_service_investigation_bpio_hotline,
      is_service_check,
      is_service_check_ib,
      is_service_check_bpio,
      is_service_check_bpio_hotline,
      is_verification_activity,
      is_db: Boolean(formValues.is_db),
      description: formValues.description,
      detected_damage: formValues.detected_damage,
      recovered_damage: formValues.recovered_damage,
      prevented_damage: formValues.prevented_damage,
      additional_income: formValues.additional_income,
      reduced_cost: formValues.reduced_cost,
      prevented_unnecessary_writeoff: formValues.prevented_unnecessary_writeoff,
      vat_deducted: formValues.vat_deducted,
      criminal_case: formValues.criminal_case
        ? {
            ...formValues.criminal_case,
            transfer_date: toDateOnlyString(formValues.criminal_case.transfer_date as any) as any,
            rejection_date: toDateOnlyString(formValues.criminal_case.rejection_date as any) as any,
            appeal_date: toDateOnlyString(formValues.criminal_case.appeal_date as any) as any,
            case_date: toDateOnlyString(formValues.criminal_case.case_date as any) as any,
          }
        : undefined,
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
