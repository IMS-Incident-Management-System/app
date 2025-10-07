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
                  <Card 
                    key={field.key} 
                    className={styles.additionallyItem}
                    title={
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>
                          Дополнение {index + 1}
                        </span>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          className={styles.deleteButton}
                        />
                      </div>
                    }
                  >
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12} lg={8}>
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
                      
                      <Col xs={24} sm={12} lg={8}>
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
                      
                      <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                          label="Наказано"
                          name={[field.name, "is_punished"]}
                          valuePropName="checked"
                        >
                          <Checkbox className={styles.checkbox}>Наказано</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left" plain>Дополнительная информация</Divider>
                    
                    <Row gutter={[24, 16]}>
                      <Col xs={24} lg={12}>
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
                      
                      <Col xs={24} lg={12}>
                        <Form.Item
                          label="Уголовные дела"
                          name={[field.name, "criminal_cases"]}
                        >
                          <Input.TextArea 
                            rows={4} 
                            placeholder="Введите информацию об уголовных делах"
                            className={styles.textArea}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left" plain>Финансовый ущерб</Divider>
                    
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
                ))}
              </div>
            </>
          )}
        </Form.List>
      </Card>
    </div>
  );
};
