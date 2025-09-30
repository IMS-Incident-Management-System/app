import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  TreeSelect,
} from "antd";
import { EventFormProps } from "./types";
import styles from "./EventForm.module.scss";
import { useState } from "react";
import { usePrepareObjects } from "../../hooks/usePrepareObjects";
import {
  DeleteOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { CriminalCaseForm } from "./CriminalCaseForm";
import { AddressForm } from "./AddressForm";
import { PersonalDataForm } from "./PersonalDataForm";

export const EventForm = ({
  name,
  eventTypes,
  isEventTypesLoading,
}: EventFormProps) => {
  const [isCriminalCasesCollapsed, setIsCriminalCasesCollapsed] =
    useState(false);

  const handleCollapseCriminalCases = () => {
    setIsCriminalCasesCollapsed(!isCriminalCasesCollapsed);
  };

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

      <AddressForm name={name} />

      <PersonalDataForm name={name} />

      <Form.List name={[name, "criminal_cases"]}>
        {(fields, { add, remove }) => (
          <div className={styles.criminalCasesWrapper}>
            <div className={styles.criminalCasesHeader}>
              <h3 className={styles.criminalCasesHeaderTitle}>
                Уголовные дела
              </h3>
              <div>
                <Button
                  type="text"
                  icon={
                    isCriminalCasesCollapsed ? (
                      <FullscreenOutlined />
                    ) : (
                      <FullscreenExitOutlined />
                    )
                  }
                  onClick={handleCollapseCriminalCases}
                />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => add(undefined, 0)}
                />
              </div>
            </div>
            <div className={styles.criminalCasesContainer}>
              {isCriminalCasesCollapsed
                ? null
                : fields.map((field) => (
                    <div key={field.key} className={styles.criminalCase}>
                      <CriminalCaseForm name={field.name} />
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
          </div>
        )}
      </Form.List>

      <Form.Item label="Выявленный ущерб" name={[name, "detected_damage"]}>
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          placeholder="Введите выявленный ущерб"
        />
      </Form.Item>

      <Form.Item
        label="Предотвращенный ущерб"
        name={[name, "prevented_damage"]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          placeholder="Введите предотвращенный ущерб"
        />
      </Form.Item>

      <Form.Item label="Возмещенный ущерб" name={[name, "recovered_damage"]}>
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          placeholder="Введите возмещенный ущерб"
        />
      </Form.Item>

      <Form.Item
        label="Описание"
        name={[name, "description"]}
        rules={[{ required: true, message: "Введите описание события" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <div className={styles.sourceContainer}>
        <h4 className={styles.sectionTitle}>Источник</h4>
        <Form.Item label="Фамилия" name={[name, "source_last_name"]}>
          <Input placeholder="Введите фамилию" />
        </Form.Item>
        <Form.Item label="Имя" name={[name, "source_first_name"]}>
          <Input placeholder="Введите имя" />
        </Form.Item>
        <Form.Item label="Отчество" name={[name, "source_middle_name"]}>
          <Input placeholder="Введите отчество" />
        </Form.Item>
        <Form.Item label="Должность" name={[name, "source_position"]}>
          <Input placeholder="Введите должность" />
        </Form.Item>
      </div>
    </div>
  );
};
