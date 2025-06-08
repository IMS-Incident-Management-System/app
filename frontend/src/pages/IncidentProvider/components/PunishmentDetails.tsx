import { Form, Input, Select, Checkbox } from "antd";
import styles from "../incidentProvider.module.scss";
import { useState, useEffect } from "react";
import { FormInstance } from "antd/es/form";

interface PunishmentDetailsProps {
  form: FormInstance;
}

export const PunishmentDetails = ({ form }: PunishmentDetailsProps) => {
  const [isPunished, setIsPunished] = useState(false);
  const guiltyPersonsCount = Form.useWatch("guiltyPersonsCount", form);

  const handlePunishedChange = (e: { target: { checked: boolean } }) => {
    setIsPunished(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({
        guiltyPersonsCount: undefined,
        measuresTakenCount: undefined,
      });
      // Сбрасываем селекторы наказаний
      const currentCount = form.getFieldValue("guiltyPersonsCount") || 0;
      Array.from({ length: currentCount }).forEach((_, index) => {
        form.setFieldsValue({ [`punishment-${index}`]: undefined });
      });
    }
  };

  useEffect(() => {
    // Сбрасываем селекторы, если guiltyPersonsCount уменьшилось
    const currentCount = Number(guiltyPersonsCount) || 0;
    const previousCount = form.getFieldValue("guiltyPersonsCount") || 0;
    if (currentCount < previousCount) {
      Array.from({ length: previousCount }).forEach((_, index) => {
        if (index >= currentCount) {
          form.setFieldsValue({ [`punishment-${index}`]: undefined });
        }
      });
      // Корректируем measuresTakenCount, если оно больше guiltyPersonsCount
      const measuresCount = form.getFieldValue("measuresTakenCount");
      if (measuresCount > currentCount) {
        form.setFieldsValue({ measuresTakenCount: currentCount });
      }
    }
  }, [guiltyPersonsCount, form]);

  return (
    <div className={styles.container}>
      <Form.Item
        className={styles.formItem}
        name="isPunished"
        valuePropName="checked"
      >
        <Checkbox onChange={handlePunishedChange}>Наказано</Checkbox>
      </Form.Item>
      {isPunished && (
        <div className={styles.container}>
          <Form.Item
            className={styles.formItem}
            name="guiltyPersonsCount"
            label="Установлено виновных лиц"
            rules={[
              { required: true, message: "Введите количество виновных" },
              {
                validator: (_, value) =>
                  Number.isInteger(Number(value)) && Number(value) >= 0
                    ? Promise.resolve()
                    : Promise.reject("Должно быть целое число ≥ 0"),
              },
            ]}
          >
            <Input
              className={styles.input}
              placeholder="Количество виновных"
              type="number"
            />
          </Form.Item>
          <Form.Item
            className={styles.formItem}
            name="measuresTakenCount"
            label="Принято мер к виновным лицам"
            rules={[
              { required: true, message: "Введите количество принятых мер" },
              {
                validator: (_, value) =>
                  Number.isInteger(Number(value)) && Number(value) >= 0
                    ? Promise.resolve()
                    : Promise.reject("Должно быть целое число ≥ 0"),
              },
              {
                validator: (_, value) =>
                  Number(value) <= form.getFieldValue("guiltyPersonsCount")
                    ? Promise.resolve()
                    : Promise.reject(
                        "Не может превышать количество виновных лиц",
                      ),
              },
            ]}
          >
            <Input
              className={styles.input}
              placeholder="Количество принятых мер"
              type="number"
            />
          </Form.Item>
          {guiltyPersonsCount > 0 && (
            <div className={styles.container}>
              {Array.from({
                length: guiltyPersonsCount || 0,
              }).map((_, index) => (
                <Form.Item
                  key={index}
                  className={styles.formItem}
                  name={`punishment-${index}`}
                  label={`Наказание ${index + 1}`}
                  rules={[
                    { required: true, message: "Выберите тип наказания" },
                  ]}
                >
                  <Select
                    className={styles.select}
                    placeholder="Выберите наказание"
                  >
                    <Select.Option value="warning">
                      Предупреждение предупредительным письмом по РП-398
                    </Select.Option>
                    <Select.Option value="remark">Замечание</Select.Option>
                    <Select.Option value="reprimand">Выговор</Select.Option>
                    <Select.Option value="dismissed">Уволено</Select.Option>
                  </Select>
                </Form.Item>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
