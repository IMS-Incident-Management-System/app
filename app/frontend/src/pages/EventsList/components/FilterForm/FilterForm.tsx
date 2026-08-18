import React, { useEffect } from "react";
import { TEventFilter } from "../../../../interfaces/requests/event";
import { Button, Card, Form, DatePicker, TreeSelect, Input } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import styles from "./FilterForm.module.scss";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";

const { RangePicker } = DatePicker;

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
      date_from: range?.[0] ? range[0].format("YYYY-MM-DD") : undefined,
      date_to: range?.[1] ? range[1].format("YYYY-MM-DD") : undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onFilter({});
  };

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
            <Input placeholder="EV-…" allowClear />
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

          <Form.Item label="Период" name="date_range" className={styles.fieldPeriod}>
            <RangePicker
              format="DD.MM.YYYY"
              placeholder={["От", "До"]}
            />
          </Form.Item>
        </div>

        <div className={styles.flagsRow}>
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
