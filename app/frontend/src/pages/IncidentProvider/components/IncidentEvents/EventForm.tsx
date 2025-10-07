import {
  Form,
  Input,
  DatePicker,
  TreeSelect,
} from "antd";
import { EventFormProps } from "./types";
import styles from "./EventForm.module.scss";
import dayjs from "dayjs";
import { AddressForm } from "./AddressForm";
import { PersonalDataForm } from "./PersonalDataForm";

export const EventForm = ({
  name,
  eventTypes,
  isEventTypesLoading,
}: EventFormProps) => {

  return (
    <div className={styles.container}>
      <Form.Item
        label="Тип инцидента"
        name={[name, "event_type_id"]}
        rules={[{ required: true, message: "Выберите тип инцидента" }]}
      >
        <TreeSelect
          showSearch
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Выберите тип инцидента"
          allowClear
          treeDefaultExpandAll
          treeData={eventTypes?.treeData}
          loading={isEventTypesLoading}
          className={styles.formInput}
        />
      </Form.Item>

      <Form.Item
        label="Дата инцидента"
        name={[name, "date"]}
        rules={[{ required: true, message: "Укажите дату инцидента" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Дата внесения инцидента"
        name={[name, "entry_date"]}
        initialValue={dayjs()}
      >
        <DatePicker 
          style={{ width: "100%" }} 
          disabled 
          placeholder="Сегодняшняя дата"
        />
      </Form.Item>

      <AddressForm name={name} />

      <PersonalDataForm name={name} />
    </div>
  );
};
