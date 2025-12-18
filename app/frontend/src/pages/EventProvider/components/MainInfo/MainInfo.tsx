import { Form, TreeSelect, DatePicker, Input, InputNumber, Checkbox, Row, Col, Card } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { CreateEventBody } from "../../../../interfaces/requests/event";
import dayjs from "dayjs";
import styles from "./MainInfo.module.scss";

const { TextArea } = Input;

export const MainInfo = () => {
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();

  return (
    <div className={styles.container}>
      {/* Основная информация */}
      <Card className={styles.sectionCard} title="Основная информация">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
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
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="date"
              label="Дата"
              rules={[{ required: true, message: "Выберите дату" }]}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                format="DD.MM.YYYY" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              name="is_service_investigation"
              valuePropName="checked"
            >
              <Checkbox>Служебные расследования</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              name="is_service_check"
              valuePropName="checked"
            >
              <Checkbox>Служебные проверки</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              name="is_service_check_ib"
              valuePropName="checked"
            >
              <Checkbox>Служебные проверки по линии ИБ</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateEventBody>
              name="is_verification_activity"
              valuePropName="checked"
            >
              <Checkbox>Проверочные мероприятия</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="quantity"
              label="Количество"
            >
              <Input placeholder="Введите количество" className={styles.formInput} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              name="description"
              label="Описание события"
            >
              <TextArea 
                rows={4} 
                placeholder="Введите описание события" 
                className={styles.textArea}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Финансовые показатели */}
      <Card className={styles.sectionCard} title="Финансовые показатели">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="detected_damage"
              label="Выявлен ущерб (руб.)"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="recovered_damage"
              label="Возмещен ущерб (руб.)"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="prevented_damage"
              label="Предотвращен ущерб (руб.)"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="additional_income"
              label="Получен дополнительный доход (руб.)"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="reduced_cost"
              label="Снижена стоимость товаров, работ и услуг на сумму (руб.)"
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="prevented_unnecessary_writeoff"
              label="Предотвращено необ. списание ДЗ, руб."
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="vat_deducted"
              label="Принят к вычету НДС, руб."
            >
              <InputNumber 
                style={{ width: "100%" }} 
                min={0} 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
