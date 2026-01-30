import { Form, Select, TreeSelect, DatePicker, Input, InputNumber, Row, Col, Card, Divider, Button, Space, Radio } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useGetDepartments } from "../../../../services/requests/departments/getDepartments";
import { useGetObjectTypes } from "../../../../services/requests/objectTypes/getObjectTypes";
import { useGetIncidentEventTypes } from "../../../../services/requests/incidentEventTypes/getIncidentEventTypes";
import { SecurityDirectionEnum } from "../../../../enums/direction";
import styles from "./MainInfo.module.scss";
import { CreateIncidentBody } from "../../../../interfaces/requests/incident";
import { directionDict } from "../../../../constants/incidentDict";
import dayjs from "dayjs";

export const MainInfo = () => {
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const { data: objectTypes, isLoading: isObjectTypesLoading } =
    useGetObjectTypes();
  const { data: eventTypes, isLoading: isEventTypesLoading } =
    useGetIncidentEventTypes();

  return (
    <div className={styles.container}>
      {/* Основная информация */}
      <Card className={styles.sectionCard} title="Основная информация">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
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
            <Form.Item<CreateIncidentBody>
              label="Направление"
              name="direction"
              rules={[
                { required: true, message: "Пожалуйста, выберите направление" },
              ]}
            >
              <Select
                options={Object.values(SecurityDirectionEnum).map((direction) => ({
                  label: directionDict[direction as SecurityDirectionEnum],
                  value: direction,
                }))}
                placeholder="Выберите направление"
                allowClear
                className={styles.formInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Типы объектов"
              name="object_type_ids"
            >
              <TreeSelect
                showSearch
                multiple
                treeCheckable
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="Выберите типы объектов"
                allowClear
                treeDefaultExpandAll
                treeData={objectTypes?.treeData}
                loading={isObjectTypesLoading}
                className={styles.formInput}
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Информация о инциденте */}
      <Card className={styles.sectionCard} title="Информация о инциденте">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Типы инцидентов"
              name={["event", "event_type_ids"]}
              rules={[
                { required: true, message: "Выберите типы инцидентов" },
              ]}
            >
              <TreeSelect
                showSearch
                multiple
                treeCheckable
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                placeholder="Выберите типы инцидентов"
                allowClear
                treeDefaultExpandAll
                treeData={eventTypes?.treeData}
                loading={isEventTypesLoading}
                className={styles.formInput}
                maxTagCount="responsive"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Дата инцидента"
              name={["event", "date"]}
              rules={[
                { required: true, message: "Укажите дату инцидента" },
              ]}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                placeholder="Выберите дату инцидента"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Дата внесения"
              name={["event", "entry_date"]}
              initialValue={dayjs()}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                disabled 
                placeholder="Сегодняшняя дата"
              />
            </Form.Item>
          </Col>
        </Row>

      </Card>

      {/* Адреса инцидента */}
      <Card className={styles.sectionCard} title="Адреса инцидента">
        <Form.List name="addresses">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card 
                  key={key} 
                  className={styles.listCard}
                  size="small"
                  title={`Адрес ${name + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      Удалить
                    </Button>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Город"
                        name={[name, "city"]}
                      >
                        <Input placeholder="Введите город" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Улица"
                        name={[name, "street"]}
                      >
                        <Input placeholder="Введите улицу" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Дом"
                        name={[name, "house"]}
                      >
                        <Input placeholder="Введите номер дома" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Корпус"
                        name={[name, "building"]}
                      >
                        <Input placeholder="Введите корпус" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Квартира"
                        name={[name, "apartment"]}
                      >
                        <Input placeholder="Введите квартиру" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className={styles.addButton}
              >
                Добавить адрес
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {/* ФИО */}
      <Card className={styles.sectionCard} title="ФИО">
        <Form.List name="persons">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card 
                  key={key} 
                  className={styles.listCard}
                  size="small"
                  title={`Персона ${name + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      Удалить
                    </Button>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Фамилия"
                        name={[name, "last_name"]}
                      >
                        <Input placeholder="Введите фамилию" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Имя"
                        name={[name, "first_name"]}
                      >
                        <Input placeholder="Введите имя" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Отчество"
                        name={[name, "middle_name"]}
                      >
                        <Input placeholder="Введите отчество" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item
                        {...restField}
                        label="Табельный номер"
                        name={[name, "employee_number"]}
                      >
                        <Input placeholder="Введите табельный номер" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={12}>
                      <Form.Item
                        {...restField}
                        label="Травма / Смертельный исход"
                        name={[name, "outcome_type"]}
                      >
                        <Radio.Group>
                          <Radio value="injury">Травма</Radio>
                          <Radio value="fatal">Смертельный исход</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className={styles.addButton}
              >
                Добавить персону
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {/* Описание инцидента */}
      <Card className={styles.sectionCard} title="Описание инцидента">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item<CreateIncidentBody>
              label="Описание"
              name="description"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Введите описание инцидента"
                className={styles.textArea}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Источник информации */}
      <Card className={styles.sectionCard} title="Источник информации">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Фамилия"
              name="source_last_name"
            >
              <Input placeholder="Введите фамилию источника" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Имя"
              name="source_first_name"
            >
              <Input placeholder="Введите имя источника" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Отчество"
              name="source_middle_name"
            >
              <Input placeholder="Введите отчество источника" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item<CreateIncidentBody>
              label="Должность"
              name="source_position"
            >
              <Input placeholder="Введите должность источника" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Финансовый ущерб */}
      <Card className={styles.sectionCard} title="Финансовый ущерб">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Выявлен ущерб (руб.)"
              name="detected_damage"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                }
                parser={(value) => {
                  const cleaned = value?.replace(/\s?|(,*)/g, "") || "";
                  return parseFloat(cleaned) || 0;
                }}
                placeholder="0"
                className={styles.formInput}
                addonAfter="₽"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Возмещен ущерб (руб.)"
              name="recovered_damage"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                }
                parser={(value) => {
                  const cleaned = value?.replace(/\s?|(,*)/g, "") || "";
                  return parseFloat(cleaned) || 0;
                }}
                placeholder="0"
                className={styles.formInput}
                addonAfter="₽"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Предотвращен ущерб (руб.)"
              name="prevented_damage"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                }
                parser={(value) => {
                  const cleaned = value?.replace(/\s?|(,*)/g, "") || "";
                  return parseFloat(cleaned) || 0;
                }}
                placeholder="0"
                className={styles.formInput}
                addonAfter="₽"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Получен дополнительный доход (руб.)"
              name="additional_income"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                }
                parser={(value) => {
                  const cleaned = value?.replace(/\s?|(,*)/g, "") || "";
                  return parseFloat(cleaned) || 0;
                }}
                placeholder="0"
                className={styles.formInput}
                addonAfter="₽"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item<CreateIncidentBody>
              label="Снижена стоимость товаров, работ и услуг на сумму (руб.)"
              name="reduced_cost"
            >
              <InputNumber<number>
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                }
                parser={(value) => {
                  const cleaned = value?.replace(/\s?|(,*)/g, "") || "";
                  return parseFloat(cleaned) || 0;
                }}
                placeholder="0"
                className={styles.formInput}
                addonAfter="₽"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
