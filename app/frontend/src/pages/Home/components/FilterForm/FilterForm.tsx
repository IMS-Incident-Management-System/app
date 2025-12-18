import React, { useEffect } from "react";
import { TIncidentFilter } from "../../../../interfaces/requests/incident";
import { Button, Card, Form, DatePicker, Select, TreeSelect } from "antd";
import styles from "./FilterForm.module.scss";
import dayjs from "dayjs";
import { directionDict } from "../../../../constants/incidentDict";
import { SecurityDirectionEnum } from "../../../../enums/direction";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { useGetObjectTypes } from "../../../../services/requests/objectTypes/getObjectTypes";
import { useGetEventTypes } from "../../../../services/requests/eventTypes/getEventTypes";

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
    useGetEventTypes();

  useEffect(() => {
    const formattedFilter = {
      ...filter,
      date_from: filter.date_from ? dayjs(filter.date_from) : null,
      date_to: filter.date_to ? dayjs(filter.date_to) : null,
    };

    form.setFieldsValue(formattedFilter);
  }, [filter, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();

    onFilter({
      ...values,
      date_from: values.date_from
        ? new Date(values.date_from.format("YYYY-MM-DD"))
        : undefined,
      date_to: values.date_to
        ? new Date(values.date_to.format("YYYY-MM-DD"))
        : undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <Card title="Фильтр" className={styles.filterForm}>
      <Form form={form} layout="vertical">
        <div className={styles.filterFormGroup}>
          <Form.Item label="Подразделение" name="department_id">
            <TreeSelect
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите подразделение"
              allowClear
              treeDefaultExpandAll
              treeData={departments?.treeData}
              loading={isDepartmentsLoading}
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item label="Направление" name="direction">
            <Select
              options={Object.values(SecurityDirectionEnum).map(
                (direction) => ({
                  label: directionDict[direction as SecurityDirectionEnum],
                  value: direction,
                }),
              )}
              placeholder="Выберите направление"
              allowClear
              className={styles.formInput}
            />
          </Form.Item>
        </div>

        <div className={styles.filterFormGroup}>
          <Form.Item label="Тип объекта" name="object_type_id">
            <TreeSelect
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              placeholder="Выберите тип объекта"
              allowClear
              treeDefaultExpandAll
              treeData={objectTypes?.treeData}
              loading={isObjectTypesLoading}
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item label="Тип инцидента" name="event_type_id">
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
        </div>

        <div className={styles.filterFormGroup}>
          <Form.Item
            name="date_from"
            label="Дата от"
            className={styles.filterFormItem}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="Дата от"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="date_to"
            label="Дата до"
            className={styles.filterFormItem}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="Дата до"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <Form.Item className={styles.button}>
          <div className={styles.buttonGroup}>
            <Button type="default" onClick={handleReset}>
              Сбросить
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Применить
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};
