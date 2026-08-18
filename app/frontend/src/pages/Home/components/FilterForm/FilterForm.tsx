import React, { useEffect } from "react";
import { TIncidentFilter } from "../../../../interfaces/requests/incident";
import { Button, Card, Form, DatePicker, TreeSelect, Input } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import styles from "./FilterForm.module.scss";
import { directionDict } from "../../../../constants/incidentDict";
import { SecurityDirectionEnum } from "../../../../enums/direction";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { useGetObjectTypes } from "../../../../services/requests/objectTypes/getObjectTypes";
import { useGetIncidentEventTypes } from "../../../../services/requests/incidentEventTypes/getIncidentEventTypes";

const { RangePicker } = DatePicker;

export const FilterForm = ({
  filter,
  onFilter,
}: {
  filter: TIncidentFilter;
  onFilter: (filter: TIncidentFilter) => void;
}) => {
  const [form] = Form.useForm();
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const { data: objectTypes, isLoading: isObjectTypesLoading } =
    useGetObjectTypes();
  const { data: eventTypes, isLoading: isEventTypesLoading } =
    useGetIncidentEventTypes();

  useEffect(() => {
    form.setFieldsValue({
      ...filter,
      date_range:
        filter.date_from && filter.date_to
          ? [dayjs(filter.date_from), dayjs(filter.date_to)]
          : undefined,
    });
  }, [filter, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const range = values.date_range as [Dayjs, Dayjs] | undefined;

    onFilter({
      code: values.code || undefined,
      department_id: values.department_id?.length ? values.department_id : undefined,
      direction: values.direction?.length ? values.direction : undefined,
      object_type_id: values.object_type_id?.length ? values.object_type_id : undefined,
      event_type_id: values.event_type_id?.length ? values.event_type_id : undefined,
      date_from: range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
      date_to: range?.[1] ? range[1].format("YYYY-MM-DD") : undefined,
      is_db: values.is_db === true ? true : undefined,
      is_sent_1db: values.is_sent_1db === true ? true : undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  const isDb = Form.useWatch("is_db", form) === true;
  const isSent1db = Form.useWatch("is_sent_1db", form) === true;

  return (
    <Card
      title={
        <span>
          <FilterOutlined style={{ marginRight: 8 }} />
          Фильтры
        </span>
      }
      className={styles.filterForm}
    >
      <Form form={form} layout="vertical">
        <div className={styles.fields}>
          <Form.Item label="ID" name="code" className={styles.fieldId}>
            <Input placeholder="IN-…" allowClear />
          </Form.Item>

          <Form.Item label="Подразделение" name="department_id" className={styles.field}>
            <TreeSelect
              showSearch
              multiple
              treeCheckable
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите подразделение"
              allowClear
              treeDefaultExpandAll
              treeData={departments?.treeData}
              loading={isDepartmentsLoading}
              maxTagCount={2}
            />
          </Form.Item>

          <Form.Item label="Направление" name="direction" className={styles.field}>
            <TreeSelect
              showSearch
              multiple
              treeCheckable
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите направление"
              allowClear
              treeDefaultExpandAll
              treeData={Object.values(SecurityDirectionEnum).map((direction) => ({
                title: directionDict[direction as SecurityDirectionEnum],
                value: direction,
                key: direction,
              }))}
              maxTagCount={2}
            />
          </Form.Item>

          <Form.Item label="Тип объекта" name="object_type_id" className={styles.field}>
            <TreeSelect
              showSearch
              multiple
              treeCheckable
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите тип объекта"
              allowClear
              treeDefaultExpandAll
              treeData={objectTypes?.treeData}
              loading={isObjectTypesLoading}
              maxTagCount={2}
            />
          </Form.Item>

          <Form.Item label="Тип инцидента" name="event_type_id" className={styles.field}>
            <TreeSelect
              showSearch
              multiple
              treeCheckable
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите тип инцидента"
              allowClear
              treeDefaultExpandAll
              treeData={eventTypes?.treeData}
              loading={isEventTypesLoading}
              maxTagCount={2}
            />
          </Form.Item>

          <Form.Item label="Период" name="date_range" className={styles.fieldPeriod}>
            <RangePicker
              format="DD.MM.YYYY"
              placeholder={["От", "До"]}
            />
          </Form.Item>
        </div>

        <Form.Item name="is_db" valuePropName="checked" hidden>
          <input type="checkbox" />
        </Form.Item>
        <Form.Item name="is_sent_1db" valuePropName="checked" hidden>
          <input type="checkbox" />
        </Form.Item>

        <div className={styles.flagsRow}>
          <div className={styles.flags}>
            <button
              type="button"
              className={`${styles.flagChip} ${isDb ? styles.flagChipOn : ""}`}
              onClick={() => form.setFieldValue("is_db", !isDb)}
            >
              <div className={styles.flagMeta}>
                <span className={styles.flagLabel}>Особо важно</span>
                <span className={styles.flagValue}>{isDb ? "Да" : "Нет"}</span>
              </div>
              <span className={`${styles.flagDot} ${isDb ? styles.flagDotOn : ""}`} />
            </button>
            <button
              type="button"
              className={`${styles.flagChip} ${isSent1db ? styles.flagChipOn : ""}`}
              onClick={() => form.setFieldValue("is_sent_1db", !isSent1db)}
            >
              <div className={styles.flagMeta}>
                <span className={styles.flagLabel}>Отправлено 1ДБ</span>
                <span className={styles.flagValue}>{isSent1db ? "Да" : "Нет"}</span>
              </div>
              <span className={`${styles.flagDot} ${isSent1db ? styles.flagDotOn : ""}`} />
            </button>
          </div>
          <div className={styles.buttonGroup}>
            <Button onClick={handleReset}>Сбросить</Button>
            <Button type="primary" onClick={handleSubmit}>
              Применить
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};
