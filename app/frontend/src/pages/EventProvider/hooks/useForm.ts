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
  updateEvent: ({ data, id }: { data: CreateEventBody; id: number }) => void;
}) => {
  const [form] = Form.useForm<CreateEventBody>();

  const onFinish = () => {
    const formValues: any = form.getFieldsValue(true);

    // Преобразуем period_date в строку формата YYYY-MM-DD
    const processedData: CreateEventBody = {
      ...formValues,
      period_date: formValues.period_date
        ? dayjs(formValues.period_date).format("YYYY-MM-DD")
        : undefined,
    };

    if (!event?.id) {
      // Создаем новое событие
      createEvent(processedData);
    } else {
      // Обновляем существующее событие
      updateEvent({
        data: processedData,
        id: event.id,
      });
    }
  };

  useEffect(() => {
    if (event) {
      // Преобразуем данные события для формы
      const formValues: any = {
        department_id: event.department_id,
        period_date: event.period_date ? dayjs(event.period_date) : undefined,
        direction: event.direction,
        category: event.category,
        // Все остальные поля берем как есть
        ...Object.keys(event).reduce((acc: any, key) => {
          if (
            ![
              "id",
              "department_id",
              "period_date",
              "direction",
              "category",
              "created_by",
              "createdAt",
              "updatedAt",
              "department",
            ].includes(key)
          ) {
            acc[key] = event[key as keyof EventWithRelations];
          }
          return acc;
        }, {}),
      };

      form.setFieldsValue(formValues);
    }
  }, [event, form]);

  return { form, onFinish };
};

