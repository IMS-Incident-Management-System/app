import { Form, Input, DatePicker, InputNumber, Button, Checkbox, Card, Row, Col, Divider, Space, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import styles from "./IncidentAdditionally.module.scss";
import dayjs from "dayjs";

const { Text } = Typography;

export const IncidentAdditionally = () => {
  return (
    <div className={styles.container}>
      <Card className={styles.sectionCard} title="Дополнения к инциденту">
        <div className={styles.description}>
          <InfoCircleOutlined className={styles.infoIcon} />
          <Text type="secondary">
            Добавьте дополнительную информацию об инциденте: ущерб, наказания, уголовные дела и другие детали
          </Text>
        </div>
        
        <Form.List name="additionally">
          {(fields, { add, remove }) => (
            <>
              <div className={styles.additionallyHeader}>
                <Button
                  className={styles.addAdditionallyButton}
                  onClick={() => add(undefined, 0)}
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                >
                  Добавить дополнение
                </Button>
              </div>
              
              <div className={styles.additionallyContainer}>
                {fields.map((field, index) => (
                  <div key={field.key} className={styles.additionallyWrapper}>
                    {/* Заголовок дополнения */}
                    <div className={styles.additionallyTitle}>
                      <span className={styles.titleText}>Дополнение {index + 1}</span>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        className={styles.deleteButton}
                      >
                        Удалить дополнение
                      </Button>
                    </div>

                    {/* Основные данные дополнения */}
                    <Card className={styles.subSectionCard} title="Основные данные">
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Дата происшествия"
                            name={[field.name, "incident_date"]}
                          >
                            <DatePicker 
                              style={{ width: "100%" }} 
                              placeholder="Выберите дату"
                              className={styles.formInput}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Дата внесения дополнения"
                            name={[field.name, "addition_date"]}
                            initialValue={dayjs()}
                          >
                            <DatePicker 
                              style={{ width: "100%" }} 
                              placeholder="Дата внесения"
                              className={styles.formInput}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Дополнительная информация */}
                    <Card className={styles.subSectionCard} title="Дополнительная информация">
                      <Row gutter={[24, 16]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Описание"
                            name={[field.name, "text_field"]}
                          >
                            <Input.TextArea 
                              rows={4} 
                              placeholder="Введите описание дополнения"
                              className={styles.textArea}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Уголовные дела */}
                    <Card className={styles.subSectionCard} title="Уголовные дела">
                      <Form.List name={[field.name, "criminal_cases_list"]}>
                        {(criminalFields, { add: addCriminal, remove: removeCriminal }) => (
                          <>
                            {criminalFields.map((crimField) => (
                              <Card 
                                key={crimField.key}
                                className={styles.nestedCard}
                                size="small"
                                title={`Уголовное дело ${crimField.name + 1}`}
                                extra={
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeCriminal(crimField.name)}
                                    size="small"
                                  >
                                    Удалить
                                  </Button>
                                }
                              >
                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Дата передачи"
                                      name={[crimField.name, "transfer_date"]}
                                    >
                                      <DatePicker style={{ width: "100%" }} placeholder="Дата передачи" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Номер документа"
                                      name={[crimField.name, "document_number"]}
                                    >
                                      <Input placeholder="Номер документа" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Подразделение"
                                      name={[crimField.name, "department_name"]}
                                    >
                                      <Input placeholder="Наименование подразделения" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Номер дела"
                                      name={[crimField.name, "case_number"]}
                                    >
                                      <Input placeholder="Номер дела" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Статья закона"
                                      name={[crimField.name, "law_article"]}
                                    >
                                      <Input placeholder="Статья закона" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24}>
                                    <Form.Item
                                      label="Результат рассмотрения"
                                      name={[crimField.name, "review_result"]}
                                    >
                                      <Input.TextArea rows={2} placeholder="Результат рассмотрения" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => addCriminal()}
                              block
                              icon={<PlusOutlined />}
                              className={styles.addButton}
                            >
                              Добавить уголовное дело
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>

                    {/* Наказания */}
                    <Card className={styles.subSectionCard} title="Наказания">
                      <Form.List name={[field.name, "punishments"]}>
                        {(punishFields, { add: addPunish, remove: removePunish }) => (
                          <>
                            {punishFields.map((punField) => (
                              <Card 
                                key={punField.key}
                                className={styles.nestedCard}
                                size="small"
                                title={`Наказание ${punField.name + 1}`}
                                extra={
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removePunish(punField.name)}
                                    size="small"
                                  >
                                    Удалить
                                  </Button>
                                }
                              >
                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Тип наказания"
                                      name={[punField.name, "punishment_type_id"]}
                                      rules={[{ required: true, message: "Выберите тип наказания" }]}
                                    >
                                      <InputNumber style={{ width: "100%" }} placeholder="ID типа наказания" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Дата наказания"
                                      name={[punField.name, "date"]}
                                      rules={[{ required: true, message: "Укажите дату" }]}
                                    >
                                      <DatePicker style={{ width: "100%" }} placeholder="Дата наказания" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Количество уволенных"
                                      name={[punField.name, "fired_count"]}
                                      rules={[{ required: true, message: "Укажите количество" }]}
                                      initialValue={0}
                                    >
                                      <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24}>
                                    <Form.Item
                                      label="Описание"
                                      name={[punField.name, "description"]}
                                    >
                                      <Input.TextArea rows={2} placeholder="Описание наказания" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>
                            ))}
                            <Button
                              type="dashed"
                              onClick={() => addPunish()}
                              block
                              icon={<PlusOutlined />}
                              className={styles.addButton}
                            >
                              Добавить наказание
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>

                    {/* Финансовый ущерб */}
                    <Card className={styles.subSectionCard} title="Финансовый ущерб">
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Выявленный ущерб"
                            name={[field.name, "detected_damage"]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                              }
                              parser={(value) => value!.replace(/\s?|(,*)/g, "")}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Предотвращенный ущерб"
                            name={[field.name, "prevented_damage"]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                              }
                              parser={(value) => value!.replace(/\s?|(,*)/g, "")}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Возмещенный ущерб"
                            name={[field.name, "recovered_damage"]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                              }
                              parser={(value) => value!.replace(/\s?|(,*)/g, "")}
                              placeholder="0"
                              className={styles.formInput}
                              addonAfter="₽"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </Form.List>
      </Card>
    </div>
  );
};
