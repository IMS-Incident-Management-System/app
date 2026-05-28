import React, { useEffect } from "react";
import { TEventFilter } from "../../../../interfaces/requests/event";
import { Button, Card, Checkbox, Form, DatePicker, TreeSelect, Input } from "antd";
import styles from "./FilterForm.module.scss";
import dayjs from "dayjs";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";

export const FilterForm = ({
  filter,
  onFilter,
}: {
  filter: TEventFilter;
  onFilter: (filter: TEventFilter) => void;
}) => {
  const [form] = Form.useForm();
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();

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
      code: values.code,
      department_id: values.department_id,
      date_from: values.date_from
        ? values.date_from.format("YYYY-MM-DD")
        : undefined,
      date_to: values.date_to
        ? values.date_to.format("YYYY-MM-DD")
        : undefined,
      is_db: values.is_db === true ? true : undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

  return (
    <Card title="Фильтр" className={styles.filterForm}>
      <Form form={form} layout="vertical">
        <div className={styles.filterFormGroup}>
          <Form.Item label="ID" name="code">
            <Input
              placeholder="Поиск по ID (например: EV-15032024-143025)"
              className={styles.formInput}
            />
          </Form.Item>

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

          <Form.Item name="is_db" valuePropName="checked" className={styles.dbFilter}>
            <Checkbox>Особо важно (1ДБ)</Checkbox>
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


