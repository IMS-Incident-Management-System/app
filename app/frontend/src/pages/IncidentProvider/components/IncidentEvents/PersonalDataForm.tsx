import { Form, Input, Row, Col } from "antd";
import styles from "./PersonalDataForm.module.scss";

interface PersonalDataFormProps {
  name: string | number;
}

export const PersonalDataForm = ({ name }: PersonalDataFormProps) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>ФИО</h4>
      
      <Form.List name={[name, "persons"]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <div key={field.key} className={styles.block}>
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Фамилия" name={[field.name, "last_name"]}>
                      <Input placeholder="Введите фамилию" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Имя" name={[field.name, "first_name"]}>
                      <Input placeholder="Введите имя" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item label="Отчество" name={[field.name, "middle_name"]}>
                      <Input placeholder="Введите отчество" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Табельный номер" name={[field.name, "employee_number"]}>
                      <Input placeholder="Введите табельный номер" />
                    </Form.Item>
                  </Col>
                </Row>
                <button type="button" onClick={() => remove(field.name)} className={styles.addBtn} style={{background:'#ff4d4f'}}>Удалить данные</button>
              </div>
            ))}
            <button type="button" onClick={() => add()} className={styles.addBtn}>Добавить данные</button>
          </>
        )}
      </Form.List>
    </div>
  );
};
