import { useEffect } from "react";
import {
  CreateOperationalActivityBody,
  OperationalActivityWithRelations,
} from "../../../interfaces/requests/operationalActivity";
import { Form } from "antd";
import dayjs from "dayjs";

export const useForm = ({
  operationalActivity,
  createOperationalActivity,
  updateOperationalActivity,
}: {
  operationalActivity: OperationalActivityWithRelations | null | undefined;
  createOperationalActivity: (data: CreateOperationalActivityBody) => void;
  updateOperationalActivity: ({ data, id }: { data: CreateOperationalActivityBody; id: number }) => void;
}) => {
  const [form] = Form.useForm<CreateOperationalActivityBody>();

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

    if (!operationalActivity?.id) {
      // Создаем новую операционную деятельность
      createOperationalActivity(processedData);
    } else {
      // Обновляем существующую операционную деятельность
      updateOperationalActivity({
        data: processedData,
        id: operationalActivity.id,
      });
    }
  };

  useEffect(() => {
    if (operationalActivity) {
      // Преобразуем данные операционной деятельности для формы
      const formValues: any = {
        department_id: operationalActivity.department_id,
        period: 
          operationalActivity.period_from && operationalActivity.period_to
            ? [dayjs(operationalActivity.period_from), dayjs(operationalActivity.period_to)]
            : undefined,
        direction: operationalActivity.direction,
        category: operationalActivity.category,
        // Все остальные поля берем как есть
        ...Object.keys(operationalActivity).reduce((acc: any, key) => {
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
            acc[key] = operationalActivity[key as keyof OperationalActivityWithRelations];
          }
          return acc;
        }, {}),
      };

      form.setFieldsValue(formValues);
    }
  }, [operationalActivity, form]);

  return { form, onFinish };
};


