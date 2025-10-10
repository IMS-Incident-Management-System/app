import { Form, Select, TreeSelect, DatePicker, Row, Col, Card } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import {
  EEventDirection,
  EventDirectionLabels,
  getCategoriesByDirection,
  getCategoryLabel,
} from "../../../../enums/event";
import styles from "./MainInfo.module.scss";
import { CreateEventBody } from "../../../../interfaces/requests/event";

export const MainInfo = () => {
  const form = Form.useFormInstance();
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();

  const selectedDirection = Form.useWatch("direction", form);
  const categories = selectedDirection
    ? getCategoriesByDirection(selectedDirection)
    : [];

  const handleDirectionChange = () => {
    // Сбрасываем категорию при изменении направления
    form.setFieldValue("category", undefined);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.sectionCard} title="Основная информация">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              label="Департамент"
              name="department_id"
              rules={[
                { required: true, message: "Пожалуйста, выберите департамент" },
              ]}
            >
              <TreeSelect
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="Выберите департамент"
                allowClear
                treeDefaultExpandAll
                treeData={departments?.treeData}
                loading={isDepartmentsLoading}
                className={styles.formInput}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              label="Период"
              name="period_date"
              rules={[{ required: true, message: "Пожалуйста, выберите период" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Выберите период"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              label="Направление (Тип)"
              name="direction"
              rules={[
                { required: true, message: "Пожалуйста, выберите направление" },
              ]}
            >
              <Select
                options={Object.values(EEventDirection).map((direction) => ({
                  label: EventDirectionLabels[direction],
                  value: direction,
                }))}
                placeholder="Выберите направление"
                allowClear
                onChange={handleDirectionChange}
                className={styles.formInput}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              label="Категория"
              name="category"
              rules={[
                { required: true, message: "Пожалуйста, выберите категорию" },
              ]}
            >
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
          </Col>
        </Row>
      </Card>
    </div>
  );
};

