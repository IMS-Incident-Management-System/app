import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Collapse,
  Button,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./EventAdditionally.module.scss";
import dayjs from "dayjs";
import { PrimaryButton } from "../../../../components/PrimaryButton";
import { CreateEventBody } from "../../../../interfaces/requests/event";

const { Text, Title } = Typography;
const { TextArea } = Input;

export const EventAdditionally = () => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );

  const toggleExpanded = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className={styles.container}>
      <Card
        className={styles.sectionCard}
        title="Дополнения к событию"
        extra={
          <Form.List name="additionally">
            {(fields, { add }) => (
              <PrimaryButton onClick={() => add()} icon={<PlusOutlined />}>
                Добавить дополнение
              </PrimaryButton>
            )}
          </Form.List>
        }
      >
        <Form.List name="additionally">
          {(fields, { add, remove }) => (
            <>
              <div className={styles.additionallyContainer}>
                {fields.map((field, index) => (
                  <div key={field.key} className={styles.additionallyWrapper}>
                    <Collapse
                      size="small"
                      className={styles.additionallyCollapse}
                      items={[
                        {
                          key: "1",
                          label: (
                            <div className={styles.additionallyTitle}>
                              <span className={styles.titleText}>
                                Дополнение {index + 1}
                              </span>
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
                              <Card
                                className={styles.subSectionCard}
                                title="Основные данные"
                              >
                                <Row gutter={[24, 16]}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item
                                      label="Дата внесения дополнения"
                                      name={[field.name, "addition_date"]}
                                      initialValue={dayjs()}
                                    >
                                      <DatePicker
                                        style={{ width: "100%" }}
                                        disabled
                                        placeholder="Сегодняшняя дата"
                                        className={styles.formInput}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={[24, 16]}>
                                  <Col xs={24}>
                                    <Form.Item
                                      label="Описание дополнения"
                                      name={[field.name, "text_field"]}
                                    >
                                      <TextArea
                                        rows={4}
                                        placeholder="Введите описание дополнения"
                                        className={styles.textArea}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>

                              {/* Фигуранты */}
                              <Card
                                className={styles.subSectionCard}
                                title="Фигуранты"
                              >
                                <Form.List name={[field.name, "persons"]}>
                                  {(personFields, { add: addPerson, remove: removePerson }) => (
                                    <>
                                      {personFields.map((personField) => (
                                        <Card
                                          key={personField.key}
                                          className={styles.listCard}
                                          size="small"
                                          title={`Фигурант ${personField.name + 1}`}
                                          extra={
                                            <Button
                                              type="text"
                                              danger
                                              icon={<DeleteOutlined />}
                                              onClick={() =>
                                                removePerson(personField.name)
                                              }
                                            >
                                              Удалить
                                            </Button>
                                          }
                                        >
                                          <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12} lg={6}>
                                              <Form.Item
                                                {...personField}
                                                label="Фамилия"
                                                name={[
                                                  personField.name,
                                                  "last_name",
                                                ]}
                                              >
                                                <Input placeholder="Введите фамилию" />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} lg={6}>
                                              <Form.Item
                                                {...personField}
                                                label="Имя"
                                                name={[
                                                  personField.name,
                                                  "first_name",
                                                ]}
                                              >
                                                <Input placeholder="Введите имя" />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} lg={6}>
                                              <Form.Item
                                                {...personField}
                                                label="Отчество"
                                                name={[
                                                  personField.name,
                                                  "middle_name",
                                                ]}
                                              >
                                                <Input placeholder="Введите отчество" />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} lg={6}>
                                              <Form.Item
                                                {...personField}
                                                label="Дата рождения"
                                                name={[
                                                  personField.name,
                                                  "birth_date",
                                                ]}
                                              >
                                                <DatePicker
                                                  style={{ width: "100%" }}
                                                  placeholder="Выберите дату рождения"
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12} lg={6}>
                                              <Form.Item
                                                {...personField}
                                                label="Табельный номер"
                                                name={[
                                                  personField.name,
                                                  "employee_number",
                                                ]}
                                              >
                                                <Input placeholder="Введите табельный номер" />
                                              </Form.Item>
                                            </Col>
                                          </Row>
                                        </Card>
                                      ))}
                                      <Button
                                        type="dashed"
                                        onClick={() => addPerson()}
                                        icon={<PlusOutlined />}
                                        style={{ width: "100%" }}
                                      >
                                        Добавить фигуранта
                                      </Button>
                                    </>
                                  )}
                                </Form.List>
                              </Card>

                              {/* Уголовные дела / административные дела */}
                              <Card
                                className={styles.subSectionCard}
                                title="Уголовные / административные дела"
                              >
                                <div className={styles.criminalSection}>
                                  <Divider orientation="left" plain>
                                    Передача материалов
                                  </Divider>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Дата передачи в ПРоО"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "transfer_date",
                                        ]}
                                      >
                                        <DatePicker
                                          style={{ width: "100%" }}
                                          placeholder="Выберите дату"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Номер документа/КУСП"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "document_number",
                                        ]}
                                      >
                                        <Input placeholder="Введите номер" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Подразделение"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "department_name",
                                        ]}
                                      >
                                        <Input placeholder="Наименование подразделения" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>

                                <div className={styles.criminalSection}>
                                  <Divider orientation="left" plain>
                                    Рассмотрение материалов
                                  </Divider>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24}>
                                      <Form.Item
                                        label="Результат рассмотрения материалов"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "review_result",
                                        ]}
                                      >
                                        <TextArea
                                          rows={2}
                                          placeholder="Опишите результат рассмотрения"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                      <Form.Item
                                        label="Причина отказа в ВУД/ВАД"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "rejection_reason",
                                        ]}
                                      >
                                        <TextArea
                                          rows={2}
                                          placeholder="Укажите причину отказа"
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Дата отказа в ВУД/ВАД"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "rejection_date",
                                        ]}
                                      >
                                        <DatePicker
                                          style={{ width: "100%" }}
                                          placeholder="Выберите дату"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Дата обжалования отказа"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "appeal_date",
                                        ]}
                                      >
                                        <DatePicker
                                          style={{ width: "100%" }}
                                          placeholder="Выберите дату"
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>

                                <div className={styles.criminalSection}>
                                  <Divider orientation="left" plain>
                                    Возбуждение дела
                                  </Divider>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Дата ВУД/ВАД"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "case_date",
                                        ]}
                                      >
                                        <DatePicker
                                          style={{ width: "100%" }}
                                          placeholder="Выберите дату"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Номер УД/АД"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "case_number",
                                        ]}
                                      >
                                        <Input placeholder="Введите номер" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Статья УКРФ/КоАПРФ"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "law_article",
                                        ]}
                                      >
                                        <Input placeholder="Номер статьи" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Инициатор возбуждения"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "initiator",
                                        ]}
                                      >
                                        <Input placeholder="ФИО или должность" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Задержано, чел."
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "detained_count",
                                        ]}
                                      >
                                        <InputNumber
                                          style={{ width: "100%" }}
                                          min={0}
                                          placeholder="0"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} lg={8}>
                                      <Form.Item
                                        label="Субъект преступления"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "subject",
                                        ]}
                                      >
                                        <Input placeholder="Описание субъекта" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>

                                <div className={styles.criminalSection}>
                                  <Divider orientation="left" plain>
                                    Привлекаемое лицо
                                  </Divider>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24}>
                                      <Form.Item
                                        label="ФИО / название юр. лица"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "person_name",
                                        ]}
                                      >
                                        <Input placeholder="Введите ФИО или название организации" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>

                                <div className={styles.criminalSection}>
                                  <Divider orientation="left" plain>
                                    Результаты по делу
                                  </Divider>
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24}>
                                      <Form.Item
                                        label="Результат рассмотрения УД/АД"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "case_result",
                                        ]}
                                      >
                                        <TextArea
                                          rows={2}
                                          placeholder="Опишите результат рассмотрения"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                      <Form.Item
                                        label="Решение (приговор) суда"
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "court_decision",
                                        ]}
                                      >
                                        <TextArea
                                          rows={2}
                                          placeholder="Опишите решение суда"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} lg={8}>
                                      <Form.Item
                                        label="Осуждено, чел."
                                        name={[
                                          field.name,
                                          "criminal_case",
                                          "convicted_count",
                                        ]}
                                      >
                                        <InputNumber
                                          style={{ width: "100%" }}
                                          min={0}
                                          placeholder="0"
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>
                              </Card>

                              {/* Наказание */}
                              <Card
                                className={styles.subSectionCard}
                                title="Наказано"
                              >
                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Установлено виновных лиц – кол-во"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "guilty_persons_count",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Принято мер к виновным лицам – кол-во"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "measures_taken_count",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Предупреждение письмом по РП-398"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "warning_letter_rp398",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Замечание"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "remark",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Выговор"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "reprimand",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Уволено – кол-во"
                                      name={[
                                        field.name,
                                        "punishment",
                                        "dismissed_count",
                                      ]}
                                      initialValue={0}
                                    >
                                      <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Card>

                              {/* Финансовые показатели по дополнению */}
                              <Card
                                className={styles.subSectionCard}
                                title="Финансовые показатели по дополнению"
                              >
                                <Row gutter={[24, 16]}>
                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Выявлен ущерб (руб.)"
                                      name={[field.name, "detected_damage"]}
                                    >
                                      <InputNumber<number>
                                        style={{ width: "100%" }}
                                        className={styles.formInput}
                                        addonAfter="₽"
                                        min={0}
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
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Возмещен ущерб (руб.)"
                                      name={[field.name, "recovered_damage"]}
                                    >
                                      <InputNumber<number>
                                        style={{ width: "100%" }}
                                        className={styles.formInput}
                                        addonAfter="₽"
                                        min={0}
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
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Предотвращен ущерб (руб.)"
                                      name={[field.name, "prevented_damage"]}
                                    >
                                      <InputNumber<number>
                                        style={{ width: "100%" }}
                                        className={styles.formInput}
                                        addonAfter="₽"
                                        min={0}
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
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Получен доп. доход (руб.)"
                                      name={[field.name, "additional_income"]}
                                    >
                                      <InputNumber<number>
                                        style={{ width: "100%" }}
                                        className={styles.formInput}
                                        addonAfter="₽"
                                        min={0}
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
                                        placeholder="0"
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} sm={12} lg={8}>
                                    <Form.Item
                                      label="Снижена стоимость ТРУ (руб.)"
                                      name={[field.name, "reduced_cost"]}
                                    >
                                      <InputNumber<number>
                                        style={{ width: "100%" }}
                                        className={styles.formInput}
                                        addonAfter="₽"
                                        min={0}
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
                                        placeholder="0"
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


