import { Select, Form } from "antd";
import styles from "../incidentProvider.module.scss";

interface Option {
  value: string;
  label: string;
}

interface FoRegionSelectProps {
  visible: boolean;
  value?: string | null;
  onChange?: (value: string) => void;
}

const foRegionOptions: Option[] = [
  { value: "Moscow", label: "Москва" },
  { value: "Center", label: "Центр" },
  { value: "NorthWest", label: "СЗ" },
  { value: "Volga", label: "Поволжье" },
  { value: "South", label: "Юг" },
  { value: "Ural", label: "Урал" },
  { value: "Siberia", label: "Сибирь" },
  { value: "FarEast", label: "ДВ" },
];

export const FoRegionSelect = ({
  visible,
  value,
  onChange,
}: FoRegionSelectProps) => {
  if (!visible) return null;

  return (
    <Form.Item
      className={styles.formItem}
      name="region"
      label="Выбор региона"
      rules={[{ required: true, message: "Выберите регион" }]}
    >
      <Select
        className={styles.select}
        placeholder="Выберите регион"
        value={value ?? undefined}
        onChange={onChange}
      >
        {foRegionOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};
