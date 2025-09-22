import { Form, Input } from "antd";
import styles from "./AddressForm.module.scss";

interface AddressFormProps {
  name: number;
}

export const AddressForm = ({ name }: AddressFormProps) => {
  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Адрес инцидента</h4>
      <Form.Item
        label="Город"
        name={[name, "city"]}
      >
        <Input placeholder="Введите город" />
      </Form.Item>
      <Form.Item
        label="Улица"
        name={[name, "street"]}
      >
        <Input placeholder="Введите улицу" />
      </Form.Item>
      <Form.Item
        label="Дом"
        name={[name, "house"]}
      >
        <Input placeholder="Введите дом" />
      </Form.Item>
      <Form.Item label="Корпус" name={[name, "building"]}>
        <Input placeholder="Введите корпус (необязательно)" />
      </Form.Item>
      <Form.Item label="Квартира/Офис" name={[name, "apartment"]}>
        <Input placeholder="Введите квартиру/офис (необязательно)" />
      </Form.Item>
    </div>
  );
};