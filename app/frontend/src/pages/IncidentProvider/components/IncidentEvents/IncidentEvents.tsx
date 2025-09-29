import { Button, Form, Input } from "antd";
import styles from "./IncidentEvents.module.scss";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { EventForm } from "./EventForm";
import { useGetEventTypes } from "../../../../services/requests/eventTypes/getEventTypes";

export const IncidentEvents = () => {
  const { data: eventTypes, isLoading: isEventTypesLoading } =
    useGetEventTypes();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Form.List name="events">
          {(fields, { add, remove }) => (
            <>
              <div className={styles.header}>
                <h3 className={styles.headerTitle}>Инциденты</h3>
                <Button
                  className={styles.addEventButton}
                  onClick={() => add(undefined, 0)}
                  type="primary"
                  icon={<PlusOutlined />}
                />
              </div>
              <div className={styles.eventsContainer}>
                {fields.map((field, index) => (
                  <div key={field.key} className={styles.event}>
                    <EventForm
                      name={field.name}
                      eventTypes={eventTypes}
                      isEventTypesLoading={isEventTypesLoading}
                    />
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

              {/* Источник находится внутри каждого события (EventForm) */}
            </>
          )}
        </Form.List>
      </div>
    </div>
  );
};
