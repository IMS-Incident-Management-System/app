import React, { useEffect } from "react";
import { TEventFilter } from "../../../../interfaces/requests/event";
import { Button, Card, Form, DatePicker, Select, TreeSelect } from "antd";
import styles from "./FilterForm.module.scss";
import dayjs from "dayjs";
import { EEventDirection, EventDirectionLabels, getCategoriesByDirection, getCategoryLabel } from "../../../../enums/event";
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
  
  const selectedDirection = Form.useWatch('direction', form);
  const categories = selectedDirection ? getCategoriesByDirection(selectedDirection) : [];

  useEffect(() => {
    const formattedFilter = {
      ...filter,
      period_from: filter.period_from ? dayjs(filter.period_from) : null,
      period_to: filter.period_to ? dayjs(filter.period_to) : null,
    };

    form.setFieldsValue(formattedFilter);
  }, [filter, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();

    onFilter({
      ...values,
      period_from: values.period_from
        ? values.period_from.format("YYYY-MM-DD")
        : undefined,
      period_to: values.period_to
        ? values.period_to.format("YYYY-MM-DD")
        : undefined,
    });
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleDirectionChange = () => {
    form.setFieldValue('category', undefined);
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
              options={Object.values(EEventDirection).map(
                (direction) => ({
                  label: EventDirectionLabels[direction],
                  value: direction,
                }),
              )}
              placeholder="Выберите направление"
              allowClear
              onChange={handleDirectionChange}
              className={styles.formInput}
            />
          </Form.Item>
        </div>

        <div className={styles.filterFormGroup}>
          <Form.Item label="Категория" name="category">
            <Select
              options={categories.map((category) => ({
                label: getCategoryLabel(category),
                value: category,
              }))}
              placeholder="Выберите категорию"
              allowClear
              disabled={!selectedDirection}
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item label="Создатель" name="created_by">
            <Select
              placeholder="Введите ID создателя"
              allowClear
              showSearch
              className={styles.formInput}
            />
          </Form.Item>
        </div>

        <div className={styles.filterFormGroup}>
          <Form.Item
            name="period_from"
            label="Период с"
            className={styles.filterFormItem}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="Дата с"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="period_to"
            label="Период по"
            className={styles.filterFormItem}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="Дата по"
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

