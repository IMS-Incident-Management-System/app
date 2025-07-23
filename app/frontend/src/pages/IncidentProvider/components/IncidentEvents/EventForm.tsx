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

export const EventForm = ({
  name,
  eventTypes,
  isEventTypesLoading,
  objects,
  isObjectsLoading,
}: EventFormProps) => {
  const [isCriminalCasesCollapsed, setIsCriminalCasesCollapsed] =
    useState(false);

  const { objectOptions } = usePrepareObjects(objects);

  const handleCollapseCriminalCases = () => {
    setIsCriminalCasesCollapsed(!isCriminalCasesCollapsed);
  };

  return (
    <div className={styles.container}>
      <Form.Item
        label="Тип события"
        name={[name, "event_type_id"]}
        rules={[{ required: true, message: "Выберите тип события" }]}
      >
        <TreeSelect
          showSearch
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Выберите тип события"
          allowClear
          treeDefaultExpandAll
          treeData={eventTypes?.treeData}
          loading={isEventTypesLoading}
          className={styles.formInput}
        />
      </Form.Item>

      <Form.Item
        label="Дата события"
        name={[name, "date"]}
        rules={[{ required: true, message: "Укажите дату события" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Объект" name={[name, "object_id"]}>
        <Select
          options={objectOptions}
          loading={isObjectsLoading}
          placeholder="Выберите объект"
        />
      </Form.Item>

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

      <Form.Item
        label="Сумма ущерба"
        name={[name, "damage_amount"]}
        rules={[{ required: true, message: "Укажите сумму ущерба" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          placeholder="Введите сумму ущерба"
        />
      </Form.Item>

      <Form.Item label="Сумма компенсации" name={[name, "compensation_amount"]}>
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          placeholder="Введите сумму компенсации"
        />
      </Form.Item>

      <Form.Item
        label="Описание"
        name={[name, "description"]}
        rules={[{ required: true, message: "Введите описание события" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
    </div>
  );
};
