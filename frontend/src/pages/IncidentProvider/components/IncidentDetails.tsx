import { Form, Input, Select, Button } from "antd";
import styles from "../incidentProvider.module.scss";

interface IncidentDetailsProps {
  eventType: string;
  onOpenCriminalCase: () => void;
}

export const IncidentDetails = ({
  eventType,
  onOpenCriminalCase,
}: IncidentDetailsProps) => {
  return (
    <div className={styles.container}>
      <h3>{eventType}</h3>
      {eventType === "Кража" && (
        <Form.Item
          className={styles.formItem}
          name="theftSubType"
          label="Подтип кражи"
          rules={[{ required: true, message: "Выберите подтип кражи" }]}
        >
          <Select className={styles.select} placeholder="Подтип кражи">
            <Select.Option value="cable">Кража кабеля</Select.Option>
            <Select.Option value="battery">Кража АКБ</Select.Option>
            <Select.Option value="equipment">Кража оборудования</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item
        className={styles.formItem}
        name="damageAmount"
        label="Выявлен ущерб, руб."
        rules={[{ required: true, message: "Введите выявленный ущерб" }]}
      >
        <Input
          className={styles.input}
          placeholder="Выявлен ущерб, руб."
          type="number"
        />
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        name="compensatedAmount"
        label="Возмещён ущерб, руб."
        rules={[{ required: true, message: "Введите возмещённый ущерб" }]}
      >
        <Input
          className={styles.input}
          placeholder="Возмещён ущерб, руб."
          type="number"
        />
      </Form.Item>
      <Button
        className={styles.button}
        type="primary"
        onClick={onOpenCriminalCase}
      >
        УД
      </Button>
    </div>
  );
};
