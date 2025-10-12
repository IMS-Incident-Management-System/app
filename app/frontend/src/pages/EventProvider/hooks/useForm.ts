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

    // Преобразуем диапазон дат в отдельные поля
    const processedData: any = {
      ...formValues,
      period_from: formValues.period?.[0]
        ? dayjs(formValues.period[0]).format("YYYY-MM-DD")
        : undefined,
      period_to: formValues.period?.[1]
        ? dayjs(formValues.period[1]).format("YYYY-MM-DD")
        : undefined,
    };
    
    // Убираем временное поле period
    delete processedData.period;

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
        period: 
          event.period_from && event.period_to
            ? [dayjs(event.period_from), dayjs(event.period_to)]
            : undefined,
        direction: event.direction,
        category: event.category,
        // Все остальные поля берем как есть
        ...Object.keys(event).reduce((acc: any, key) => {
          if (
            ![
              "id",
              "department_id",
              "period_from",
              "period_to",
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

