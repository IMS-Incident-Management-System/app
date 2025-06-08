import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface EtskbDepartmentSelectProps {
  visible: boolean;
}

const etskbOptions: Option[] = [
  { value: "ODS", label: "ОДС" },
  { value: "ChiefsETSKB", label: "Начальники ЕЦКБ" },
];

export const EtskbDepartmentSelect = ({ visible }: EtskbDepartmentSelectProps) => {
  if (!visible) return null;

  return (
    <Form.Item
      className={styles.formItem}
      name="etskbDepartment"
      label="Выбор подразделения"
      rules={[{ required: true, message: "Выберите подразделение" }]}
    >
      <Select
        className={styles.select}
        placeholder="Выберите подразделение"
      >
        {etskbOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};