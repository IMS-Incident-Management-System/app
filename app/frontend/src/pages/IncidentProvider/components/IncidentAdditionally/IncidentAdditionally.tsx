import { Form, Input, DatePicker, InputNumber, Button, Checkbox, Card, Row, Col, Divider, Space, Typography, Collapse } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./IncidentAdditionally.module.scss";
import dayjs from "dayjs";

const { Text } = Typography;

export const IncidentAdditionally = () => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
                  onClick={() => add()}
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
                    <Collapse
                      ghost
                      size="small"
                      className={styles.additionallyCollapse}
                      items={[
                        {
                          key: '1',
                          label: (
                            <div className={styles.additionallyTitle}>
                              <span className={styles.titleText}>Дополнение {index + 1}</span>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(field.name);
                                }}
                                className={styles.deleteButton}
                              >
                                Удалить дополнение
                              </Button>
                            </div>
                          ),
                          children: (
                            <div className={styles.additionallyContent}>

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

                    {/* Уголовное дело */}
                    <Card className={styles.subSectionCard} title="Уголовное дело">
                      <Divider orientation="left" plain>Передача материалов</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Дата передачи в ПРоО"
                            name={[field.name, "criminal_case", "transfer_date"]}
                            tooltip="Дата передачи материалов в правоохранительные органы"
                          >
                            <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Номер документа/КУСП"
                            name={[field.name, "criminal_case", "document_number"]}
                            tooltip="Номер вх./исх. документа или Номер КУСП"
                          >
                            <Input placeholder="Введите номер" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Подразделение"
                            name={[field.name, "criminal_case", "department_name"]}
                            tooltip="Наименование подразделения, куда переданы материалы"
                          >
                            <Input placeholder="Название подразделения" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" plain>Рассмотрение материалов</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Результат рассмотрения"
                            name={[field.name, "criminal_case", "review_result"]}
                          >
                            <Input.TextArea rows={2} placeholder="Опишите результат" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Дата отказа"
                            name={[field.name, "criminal_case", "rejection_date"]}
                            tooltip="Дата отказа в возбуждении УД/АД"
                          >
                            <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Дата обжалования"
                            name={[field.name, "criminal_case", "appeal_date"]}
                            tooltip="Дата обжалования отказа"
                          >
                            <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} lg={8}>
                          <Form.Item
                            label="Причина отказа"
                            name={[field.name, "criminal_case", "rejection_reason"]}
                            tooltip="Причина отказа в возбуждении УД/АД"
                          >
                            <Input placeholder="Укажите причину" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" plain>Возбуждение дела</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Дата возбуждения"
                            name={[field.name, "criminal_case", "case_date"]}
                            tooltip="Дата возбуждения УД/АД"
                          >
                            <DatePicker style={{ width: "100%" }} placeholder="Выберите дату" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Номер дела"
                            name={[field.name, "criminal_case", "case_number"]}
                            tooltip="Номер УД/АД"
                          >
                            <Input placeholder="Введите номер" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Статья"
                            name={[field.name, "criminal_case", "law_article"]}
                            tooltip="Статья УКРФ/КоАПРФ"
                          >
                            <Input placeholder="Номер статьи" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Инициатор"
                            name={[field.name, "criminal_case", "initiator"]}
                            tooltip="Инициатор возбуждения УД/АД"
                          >
                            <Input placeholder="ФИО инициатора" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Задержано"
                            name={[field.name, "criminal_case", "detained_count"]}
                            tooltip="Задержано, человек"
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="чел." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} lg={8}>
                          <Form.Item
                            label="Субъект преступления"
                            name={[field.name, "criminal_case", "subject"]}
                            tooltip="Субъект преступления УД/АД"
                          >
                            <Input placeholder="Описание субъекта" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" plain>Привлекаемое лицо</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24}>
                          <Form.Item
                            label="ФИО / Название организации"
                            name={[field.name, "criminal_case", "person_name"]}
                            tooltip="ФИО лица или название юридического лица, привлекаемого к уголовной/административной ответственности"
                          >
                            <Input placeholder="Введите ФИО или название организации" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider orientation="left" plain>Результаты</Divider>
                      <Row gutter={[16, 16]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Результат рассмотрения"
                            name={[field.name, "criminal_case", "case_result"]}
                            tooltip="Результат рассмотрения УД/АД"
                          >
                            <Input.TextArea rows={2} placeholder="Опишите результат рассмотрения" />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item
                            label="Решение суда"
                            name={[field.name, "criminal_case", "court_decision"]}
                            tooltip="Решение (приговор) суда"
                          >
                            <Input.TextArea rows={2} placeholder="Опишите решение или приговор" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Осуждено"
                            name={[field.name, "criminal_case", "convicted_count"]}
                            tooltip="Осуждено, человек"
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" addonAfter="чел." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    {/* Наказание */}
                    <Card className={styles.subSectionCard} title="Наказание">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Установлено виновных лиц"
                            name={[field.name, "punishment", "guilty_persons_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Принято мер к виновным лицам"
                            name={[field.name, "punishment", "measures_taken_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Предупреждение предупредительным письмом по РП-398"
                            name={[field.name, "punishment", "warning_letter_rp398"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Замечание"
                            name={[field.name, "punishment", "remark"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Выговор"
                            name={[field.name, "punishment", "reprimand"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} lg={8}>
                          <Form.Item
                            label="Уволено"
                            name={[field.name, "punishment", "dismissed_count"]}
                            initialValue={0}
                          >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                          </Form.Item>
                        </Col>
                      </Row>
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
                          ),
                        },
                      ]}
                    />
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
