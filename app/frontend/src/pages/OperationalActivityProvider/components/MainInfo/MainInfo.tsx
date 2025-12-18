import { Form, Select, TreeSelect, DatePicker, Row, Col, Card, Input } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import {
  EOperationalActivityDirection,
  OperationalActivityDirectionLabels,
} from "../../../../enums/operationalActivity";
import styles from "./MainInfo.module.scss";
import { CreateOperationalActivityBody } from "../../../../interfaces/requests/operationalActivity";

const { RangePicker } = DatePicker;

export const MainInfo = () => {
  const form = Form.useFormInstance();
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();

  return (
    <div className={styles.container}>
      <Card className={styles.sectionCard} title="Основная информация">
        <div className={styles.formFields}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item<CreateOperationalActivityBody>
                label="Подразделение"
                name="department_id"
                rules={[
                  { required: true, message: "Пожалуйста, выберите подразделение" },
                ]}
              >
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
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="Период"
                name="period"
                rules={[{ required: true, message: "Пожалуйста, выберите период" }]}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  placeholder={["Дата с", "Дата по"]}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item<CreateOperationalActivityBody>
                label="Направление (Тип)"
                name="direction"
                rules={[
                  { required: true, message: "Пожалуйста, выберите направление" },
                ]}
              >
                <Select
                  options={Object.values(EOperationalActivityDirection).map((direction) => ({
                    label: OperationalActivityDirectionLabels[direction],
                    value: direction,
                  }))}
                  placeholder="Выберите направление"
                  allowClear
                  className={styles.formInput}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};


