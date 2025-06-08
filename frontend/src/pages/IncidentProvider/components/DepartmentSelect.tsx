import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface DepartmentSelectProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const departmentOptions: Option[] = [
  { value: "KTS", label: "КЦ" },
  { value: "FO", label: "ФО" },
  { value: "DZK", label: "ДЗК" },
  { value: "ETSKB", label: "ЕЦКБ" },
];

export const DepartmentSelect = ({
  value,
  onChange,
}: DepartmentSelectProps) => {
  return (
    <Form.Item
      className={styles.formItem}
      name="department"
      label="Выбор отдела"
      rules={[{ required: true, message: "Выберите отдел" }]}
    >
      <Select
        className={styles.select}
        placeholder="Выберите отдел"
        value={value ?? undefined}
        onChange={onChange}
      >
        {departmentOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
