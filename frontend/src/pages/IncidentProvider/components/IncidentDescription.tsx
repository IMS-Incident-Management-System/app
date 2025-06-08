import { Form, Input } from "antd";
import styles from "../incidentProvider.module.scss";
import { FormInstance } from "antd/es/form";

interface IncidentDescriptionProps {
  form: FormInstance;
}

export const IncidentDescription = ({ form }: IncidentDescriptionProps) => {
  return (
    <div className={styles.container}>
      <Form.Item
        className={styles.formItem}
        name="incidentDescription"
        label="Описание инцидента"
      >
        <Input.TextArea
          className={styles.descriptionInput}
          placeholder="Сообщение"
          rows={4}
        />
      </Form.Item>
    </div>
  );
};
