import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface DzkDepartmentSelectProps {
  visible: boolean;
}

const dzkOptions: Option[] = [
  { value: "MGTS", label: "МГТС" },
  { value: "RTK", label: "РТК" },
  { value: "MTSBank", label: "МТС-Банк" },
  { value: "Stream", label: "Стрим" },
  { value: "Belarus", label: "Беларусь" },
  { value: "Advantage", label: "Авантаж" },
  { value: "Greenbush", label: "Гринбуш" },
  { value: "STV", label: "СТВ" },
  { value: "MTT", label: "МТТ" },
  { value: "ITGrad", label: "ИТ-ГРАД" },
  { value: "Digital", label: "Диджитал" },
  { value: "KION", label: "КИОН" },
  { value: "ORK", label: "ОРК" },
  { value: "Live", label: "Лайв" },
  { value: "KP", label: "КП" },
  { value: "KS", label: "КС" },
  { value: "PT", label: "ПТ" },
];

export const DzkDepartmentSelect = ({ visible }: DzkDepartmentSelectProps) => {
  if (!visible) return null;

  return (
    <Form.Item
      className={styles.formItem}
      name="dzkDepartment"
      label="Выбор подразделения"
      rules={[{ required: true, message: "Выберите подразделение" }]}
    >
      <Select
        className={styles.select}
        placeholder="Выберите подразделение"
      >
        {dzkOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};