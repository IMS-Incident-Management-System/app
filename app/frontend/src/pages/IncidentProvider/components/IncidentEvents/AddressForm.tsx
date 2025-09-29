import { Form, Input, Row, Col } from "antd";
import styles from "./AddressForm.module.scss";

interface AddressFormProps {
  name: number;
}

export const AddressForm = ({ name }: AddressFormProps) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Адрес инцидента</h4>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Город"
            name={[name, "city"]}
          >
            <Input placeholder="Введите город" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Улица"
            name={[name, "street"]}
          >
            <Input placeholder="Введите улицу" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Дом"
            name={[name, "house"]}
          >
            <Input placeholder="Введите дом" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Корпус" name={[name, "building"]}>
            <Input placeholder="Введите корпус (необязательно)" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Квартира/Офис" name={[name, "apartment"]}>
            <Input placeholder="Введите квартиру/офис (необязательно)" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};