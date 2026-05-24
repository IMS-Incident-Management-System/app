import { Button, Form } from "antd";
import styles from "./IncidentPunishments.module.scss";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { IncidentPunishment } from "./IncidentPunishment";

export const IncidentPunishments = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Form.List name="punishments">
          {(fields, { add, remove }) => (
            <>
              <div className={styles.header}>
                <h3 className={styles.headerTitle}>Наказания</h3>
                <Button
                  className={styles.addPunishmentButton}
                  onClick={() => add(undefined, 0)}
                  type="primary"
                  icon={<PlusOutlined />}
                />
              </div>
              <div className={styles.punishmentsContainer}>
                {fields.map((field, index) => (
                  <div key={field.key} className={styles.punishment}>
                    <IncidentPunishment name={field.name} />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                      style={{ position: "absolute", top: 0, right: 0 }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </Form.List>
      </div>
    </div>
  );
};
