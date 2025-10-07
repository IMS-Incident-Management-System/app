import { Form, Input, Row, Col } from "antd";
import styles from "./AddressForm.module.scss";

interface AddressFormProps {
  name: string | number;
}

export const AddressForm = ({ name }: AddressFormProps) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Адрес инцидента</h4>
      
      <Form.List name={[name, "addresses"]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <div key={field.key} className={styles.block}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Город" name={[field.name, "city"]}>
                      <Input placeholder="Введите город" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Улица" name={[field.name, "street"]}>
                      <Input placeholder="Введите улицу" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={6}>
                    <Form.Item label="Дом" name={[field.name, "house"]}>
                      <Input placeholder="Введите дом" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item label="Корпус" name={[field.name, "building"]}>
                      <Input placeholder="Введите корпус (необязательно)" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item label="Номер" name={[field.name, "number"]}>
                      <Input placeholder="Введите номер (необязательно)" />
                    </Form.Item>
                  </Col>
                </Row>
                <button type="button" onClick={() => remove(field.name)} className={styles.addBtn} style={{background:'#ff4d4f'}}>Удалить адрес</button>
              </div>
            ))}
            <button type="button" onClick={() => add()} className={styles.addBtn}>Добавить адрес</button>
          </>
        )}
      </Form.List>
    </div>
  );
};