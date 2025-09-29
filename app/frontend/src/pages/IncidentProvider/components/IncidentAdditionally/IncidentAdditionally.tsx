import { Form, Input } from "antd";
import styles from "./IncidentAdditionally.module.scss";

export const IncidentAdditionally = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Дополнительно</h3>
      </div>
      <div className={styles.content}>
        <Form.Item label="Сообщение" name="message">
          <Input.TextArea className={styles.formInput} />
        </Form.Item>

        {/* Источник перенесён внутрь каждого события */}
      </div>
    </div>
  );
};
