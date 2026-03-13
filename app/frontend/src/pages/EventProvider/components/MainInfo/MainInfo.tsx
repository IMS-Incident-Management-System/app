import { Form, TreeSelect, DatePicker, Input, InputNumber, Radio, Row, Col, Card } from "antd";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { CreateEventBody } from "../../../../interfaces/requests/event";
import dayjs from "dayjs";
import styles from "./MainInfo.module.scss";

const { TextArea } = Input;

export const MainInfo = () => {
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const form = Form.useFormInstance();

  const handleEventTypeChange = (e: any) => {
    const value = e.target.value;
    // Сбрасываем все boolean поля
    form.setFieldsValue({
      is_service_investigation: false,
      is_service_investigation_ib: false,
      is_service_investigation_bpio: false,
      is_service_investigation_bpio_hotline: false,
      is_service_check: false,
      is_service_check_ib: false,
      is_service_check_bpio: false,
      is_service_check_bpio_hotline: false,
      is_verification_activity: false,
    });
    // Устанавливаем выбранное поле в true
    if (value) {
      form.setFieldsValue({ [value]: true });
    }
  };

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
              label="Дата события"
              rules={[{ required: true, message: "Выберите дату события" }]}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                format="DD.MM.YYYY" 
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="entry_date"
              label="Дата внесения"
              initialValue={dayjs()}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                format="DD.MM.YYYY" 
                disabled
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item<CreateEventBody>
              name="event_type"
              label="Тип события"
              rules={[{ required: true, message: "Выберите тип события" }]}
            >
              <Radio.Group onChange={handleEventTypeChange}>
                <Radio value="is_service_investigation">Служебные расследования</Radio>
                <Radio value="is_service_investigation_ib">Служебные расследования ИБ</Radio>
                <Radio value="is_service_investigation_bpio">Служебные расследования БПиО</Radio>
                <Radio value="is_service_investigation_bpio_hotline">Служебные расследования БПиО (горячая линия)</Radio>
                <Radio value="is_service_check">Служебные проверки</Radio>
                <Radio value="is_service_check_ib">Служебные проверки ИБ</Radio>
                <Radio value="is_service_check_bpio">Служебная проверка БПиО</Radio>
                <Radio value="is_service_check_bpio_hotline">Служебная проверка БПиО (горячая линия)</Radio>
                <Radio value="is_verification_activity">Проверочные мероприятия</Radio>
              </Radio.Group>
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
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="recovered_damage"
              label="Возмещен ущерб (руб.)"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="prevented_damage"
              label="Предотвращен ущерб (руб.)"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="additional_income"
              label="Получен дополнительный доход (руб.)"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="reduced_cost"
              label="Снижена стоимость товаров, работ и услуг на сумму (руб.)"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="prevented_unnecessary_writeoff"
              label="Предотвращено необ. списание ДЗ, руб."
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateEventBody>
              name="vat_deducted"
              label="Принят к вычету НДС, руб."
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                min={0}
                className={styles.formInput}
                formatter={(value) => {
                  if (value === null || value === undefined || value === "") return "0";
                  const str = String(value).replace(/\./g, ",");
                  const [rawIntPart, rawDecimalPart] = str.split(",");
                  const digitsInt = rawIntPart.replace(/\D/g, "") || "0";
                  const withSpaces = digitsInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                  return rawDecimalPart !== undefined && rawDecimalPart !== ""
                    ? `${withSpaces},${rawDecimalPart}`
                    : withSpaces;
                }}
                parser={(value) => {
                  if (!value) return 0;
                  const normalized = value
                    .toString()
                    .replace(/\s/g, "")
                    .replace(/,/g, ".");
                  const result = parseFloat(normalized);
                  if (Number.isNaN(result)) return 0;
                  return Math.round(result * 100) / 100;
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
