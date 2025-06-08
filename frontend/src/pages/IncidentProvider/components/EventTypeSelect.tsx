import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface EventTypeSelectProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const eventTypeOptions = [
  { value: "Theft", label: "Кража" },
  { value: "Fire", label: "Пожар/Возгорание" },
  { value: "Damage", label: "Повреждения/Порча имущества" },
  { value: "UAV", label: "БПЛА" },
  { value: "Arson", label: "Поджоги" },
];

export const EventTypeSelect = ({ value, onChange }: EventTypeSelectProps) => {
  return (
    <Form.Item
      className={styles.formItem}
      name="eventType"
      label="Тип события"
      rules={[{ required: true, message: "Тип события" }]}
    >
      <Select
        className={styles.select}
        placeholder="Тип события"
        value={value ?? undefined}
        onChange={onChange}
      >
        {eventTypeOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
