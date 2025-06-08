import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface KtsSubDepartmentSelectProps {
  visible: boolean;
}

const ktsSubOptions: Option[] = [
  { value: "DEB", label: "ДЭБ" },
  { value: "DIB", label: "ДИБ" },
  { value: "DAF", label: "ДАФ" },
  { value: "DBPiO", label: "ДБПиО" },
];

export const KtsSubDepartmentSelect = ({
  visible,
}: KtsSubDepartmentSelectProps) => {
  if (!visible) return null;

  return (
    <Form.Item
      className={styles.formItem}
      name="subDepartment"
      label="Выбор субподразделения"
      rules={[{ required: true, message: "Выберите субподразделение" }]}
    >
      <Select className={styles.select} placeholder="Выберите субподразделение">
        {ktsSubOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
