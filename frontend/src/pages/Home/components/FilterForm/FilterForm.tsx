import React, { useEffect } from "react";
import { TIncidentFilter } from "../../../../interfaces/requests/incident";
import { Button, Card, Form, DatePicker, Select } from "antd";
import styles from "./FilterForm.module.scss";
import dayjs from "dayjs";

export const FilterForm = ({
  filter,
  onFilter,
}: {
  filter: TIncidentFilter;
  onFilter: (filter: TIncidentFilter) => void;
}) => {
  const [form] = Form.useForm();

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
          <Form.Item
            name="department_id"
            label="Отдел"
            className={styles.filterFormItem}
          >
            <Select options={[]} placeholder="Выберите отдел" />
          </Form.Item>

          <Form.Item
            name="direction"
            label="Направление"
            className={styles.filterFormItem}
          >
            <Select options={[]} placeholder="Выберите направление" />
          </Form.Item>
        </div>

        <div className={styles.filterFormGroup}>
          <Form.Item
            name="status"
            label="Статус"
            className={styles.filterFormItem}
          >
            <Select options={[]} placeholder="Выберите статус" />
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
        </div>

        <div className={styles.filterFormGroup}>
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
