import { Form, InputNumber, Card, Row, Col } from "antd";
import styles from "./EventPunishment.module.scss";
import { CreateEventBody } from "../../../../interfaces/requests/event";

export const EventPunishment = () => {
  return (
    <Card className={styles.sectionCard} title="Наказание">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Установлено виновных лиц"
            name={["punishment", "guilty_persons_count"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Установлено сотрудников, причастных к инциденту"
            name={["punishment", "employees_involved_count"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Задержаны лица при совершении правонарушения"
            name={["punishment", "detained_persons_count"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Принято мер к виновным лицам"
            name={["punishment", "measures_taken_count"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Предупреждение предупредительным письмом по РП-398"
            name={["punishment", "warning_letter_rp398"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Количество замечаний"
            name={["punishment", "remark"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Количество выговоров"
            name={["punishment", "reprimand"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Form.Item<CreateEventBody>
            label="Количество уволенных лиц"
            name={["punishment", "dismissed_count"]}
            initialValue={0}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              placeholder="0" 
              className={styles.formInput}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

