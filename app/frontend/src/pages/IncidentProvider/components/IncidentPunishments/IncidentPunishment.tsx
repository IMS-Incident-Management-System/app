import { DatePicker, Form, InputNumber } from "antd";
import styles from "./IncidentPunishment.module.scss";

export const IncidentPunishment = ({ name }: { name: number }) => {
  return (
    <div className={styles.container}>
      <Form.Item
        label="Установлено виновных лиц"
        name={[name, "guilty_persons_count"]}
      >
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item
        label="Принято мер к виновным лицам"
        name={[name, "punished_persons_count"]}
      >
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item
        label="Предупреждение предупредительным письмом"
        name={[name, "warnings_count"]}
      >
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item label="Количество замечаний" name={[name, "reprimands_count"]}>
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item
        label="Количество выговоров"
        name={[name, "severe_reprimands_count"]}
      >
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item label="Количество уволенных лиц" name={[name, "fired_count"]}>
        <InputNumber className={styles.input} />
      </Form.Item>

      <Form.Item label="Дата" name={[name, "date"]}>
        <DatePicker className={styles.input} />
      </Form.Item>
    </div>
  );
};
