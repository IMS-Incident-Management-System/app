import { Form, Input, Row, Col } from "antd";
import styles from "./PersonalDataForm.module.scss";

interface PersonalDataFormProps {
  name: number;
}

export const PersonalDataForm = ({ name }: PersonalDataFormProps) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Персональные данные</h4>
      
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Фамилия"
            name={[name, "last_name"]}
          >
            <Input placeholder="Введите фамилию" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Имя"
            name={[name, "first_name"]}
          >
            <Input placeholder="Введите имя" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Отчество"
            name={[name, "middle_name"]}
          >
            <Input placeholder="Введите отчество" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Табельный номер"
            name={[name, "employee_number"]}
          >
            <Input placeholder="Введите табельный номер" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
