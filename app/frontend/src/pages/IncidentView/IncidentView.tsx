import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Spin, Space, Divider, Row, Col, Tag, Descriptions } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { ERoutes } from "../../enums/routes";
import { EIncidentDirection } from "../../enums/incident";
import dayjs from "dayjs";
import styles from "./IncidentView.module.scss";
import { PrimaryButton } from "../../components/PrimaryButton";

const { Title, Text } = Typography;

export const IncidentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: incident, isLoading } = useGetIncident(id);

  const handleBack = () => {
    navigate(ERoutes.INCIDENTS_LIST);
  };

  const handleEdit = () => {
    navigate(`${ERoutes.INCIDENT_CREATE}/${id}`);
  };

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case EIncidentDirection.INFORMATION:
        return "ИБ";
      case EIncidentDirection.ECONOMIC:
        return "ЭБ";
      case EIncidentDirection.SECURITY:
        return "БПиО";
      case EIncidentDirection.CYBER:
        return "КБ";
      case EIncidentDirection.ANTIFRAUD:
        return "Антифрод";
      case EIncidentDirection.SORM:
        return "СОРМ";
      default:
        return direction;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className={styles.container}>
        <Card>
          <Title level={3}>Инцидент не найден</Title>
          <PrimaryButton variant="secondary" onClick={handleBack}>Вернуться на главную</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.mainCard}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <PrimaryButton 
              variant="secondary"
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
            >
              Назад
            </PrimaryButton>
            <Title level={2} className={styles.title}>
              Инцидент #{incident.id}
            </Title>
            <PrimaryButton 
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Редактировать
            </PrimaryButton>
          </div>
        </div>

        <div className={styles.content}>
          {/* Основная информация */}
          <Card title="Основная информация" className={styles.sectionCard}>
            <Descriptions column={2} size="middle">
              <Descriptions.Item label="ID инцидента">
                <Text strong>#{incident.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {dayjs(incident.createdAt).format("DD.MM.YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Подразделение">
                <Tag color="blue">{incident.department?.title}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Направление">
                <Tag color="green">{getDirectionText(incident.direction)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Тип объекта">
                <Tag color="purple">{incident.object_type?.title || "Не указан"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дело безопасности">
                <Tag color={incident.is_db ? "red" : "default"}>
                  {incident.is_db ? "Да (1-ДБ)" : "Нет"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Информация о инциденте */}
          {incident.events && incident.events.length > 0 && (
            <Card title="Информация о инциденте" className={styles.sectionCard}>
              <Descriptions column={2} size="middle">
                <Descriptions.Item label="Типы инцидентов">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {incident.events.map((event, index) => (
                      <Tag key={index} color="blue">
                        {event.event_type?.title}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Дата инцидента">
                  {dayjs(incident.events[0].date).format("DD.MM.YYYY")}
                </Descriptions.Item>
                {incident.events[0].entry_date && (
                  <Descriptions.Item label="Дата внесения">
                    {dayjs(incident.events[0].entry_date).format("DD.MM.YYYY")}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Адреса инцидента */}
          {incident.addresses && incident.addresses?.length > 0 && (
            <Card title="Адреса инцидента" className={styles.sectionCard}>
              {incident.addresses?.map((address, index) => (
                <div key={address.id || index} className={styles.itemBlock}>
                  <Title level={5}>Адрес {index + 1}</Title>
                  <Row gutter={[16, 8]}>
                    {address.city && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Город:</Text> {address.city}
                      </Col>
                    )}
                    {address.street && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Улица:</Text> {address.street}
                      </Col>
                    )}
                    {address.house && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Дом:</Text> {address.house}
                      </Col>
                    )}
                    {address.building && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Корпус:</Text> {address.building}
                      </Col>
                    )}
                    {address.apartment && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Квартира:</Text> {address.apartment}
                      </Col>
                    )}
                  </Row>
                  {index < (incident.addresses?.length || 0) - 1 ? <Divider /> : null}
                </div>
              ))}
            </Card>
          )}

          {/* ФИО */}
          {incident.persons && incident.persons?.length > 0 && (
            <Card title="ФИО" className={styles.sectionCard}>
              {incident.persons?.map((person, index) => (
                <div key={person.id || index} className={styles.itemBlock}>
                  <Title level={5}>Персона {index + 1}</Title>
                  <Row gutter={[16, 8]}>
                    {person.last_name && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Фамилия:</Text> {person.last_name}
                      </Col>
                    )}
                    {person.first_name && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Имя:</Text> {person.first_name}
                      </Col>
                    )}
                    {person.middle_name && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Отчество:</Text> {person.middle_name}
                      </Col>
                    )}
                    {person.employee_number && (
                      <Col xs={24} sm={12} lg={6}>
                        <Text strong>Табельный номер:</Text> {person.employee_number}
                      </Col>
                    )}
                  </Row>
                  {index < (incident.persons?.length || 0) - 1 ? <Divider /> : null}
                </div>
              ))}
            </Card>
          )}

          {/* Описание инцидента */}
          {incident.description && (
            <Card title="Описание инцидента" className={styles.sectionCard}>
              <Text>{incident.description}</Text>
            </Card>
          )}

          {/* Источник информации */}
          {(incident.source_last_name || incident.source_first_name || incident.source_middle_name || incident.source_position) && (
            <Card title="Источник информации" className={styles.sectionCard}>
              <Row gutter={[16, 8]}>
                {incident.source_last_name && (
                  <Col xs={24} sm={12} lg={6}>
                    <Text strong>Фамилия:</Text> {incident.source_last_name}
                  </Col>
                )}
                {incident.source_first_name && (
                  <Col xs={24} sm={12} lg={6}>
                    <Text strong>Имя:</Text> {incident.source_first_name}
                  </Col>
                )}
                {incident.source_middle_name && (
                  <Col xs={24} sm={12} lg={6}>
                    <Text strong>Отчество:</Text> {incident.source_middle_name}
                  </Col>
                )}
                {incident.source_position && (
                  <Col xs={24} sm={12} lg={6}>
                    <Text strong>Должность:</Text> {incident.source_position}
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Дополнительная информация */}
          {incident.additionally && incident.additionally?.length > 0 && (
            <Card title="Дополнительная информация" className={styles.sectionCard}>
              {incident.additionally?.map((addition, index) => (
                <div key={addition.id || index} className={styles.additionWrapper}>
                  <div className={styles.additionHeader}>
                    <Title level={4}>Дополнение #{index + 1}</Title>
                  </div>
                  
                  {/* Основные данные */}
                  <div className={styles.subSection}>
                    <Title level={5}>Основные данные</Title>
                    <Descriptions column={2} size="middle">
                      {addition.addition_date && (
                        <Descriptions.Item label="Дата внесения дополнения">
                          {dayjs(addition.addition_date).format("DD.MM.YYYY")}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </div>

                  {/* ФИО фигуранта */}
                  {addition.persons && addition.persons.length > 0 && (
                    <div className={styles.subSection}>
                      <Title level={5}>ФИО фигуранта</Title>
                      {addition.persons.map((person, personIndex) => (
                        <div key={person.id || personIndex} className={styles.itemBlock}>
                          <Title level={5}>Фигурант {personIndex + 1}</Title>
                          <Descriptions column={2} size="middle">
                            {person.last_name && (
                              <Descriptions.Item label="Фамилия">
                                {person.last_name}
                              </Descriptions.Item>
                            )}
                            {person.first_name && (
                              <Descriptions.Item label="Имя">
                                {person.first_name}
                              </Descriptions.Item>
                            )}
                            {person.middle_name && (
                              <Descriptions.Item label="Отчество">
                                {person.middle_name}
                              </Descriptions.Item>
                            )}
                            {person.birth_date && (
                              <Descriptions.Item label="Дата рождения">
                                {dayjs(person.birth_date).format("DD.MM.YYYY")}
                              </Descriptions.Item>
                            )}
                            {person.employee_number && (
                              <Descriptions.Item label="Табельный номер">
                                {person.employee_number}
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                          {personIndex < (addition.persons?.length || 0) - 1 && <Divider />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Описание */}
                  {addition.text_field && (
                    <div className={styles.subSection}>
                      <Title level={5}>Описание</Title>
                      <Text>{addition.text_field}</Text>
                    </div>
                  )}

                  {/* Уголовное дело */}
                  {addition.criminal_case && (
                    <div className={styles.subSection}>
                      <Title level={5} className={styles.subSectionTitle}>Уголовное дело</Title>
                      
                      {/* Передача материалов */}
                      {(addition.criminal_case.transfer_date || addition.criminal_case.document_number || addition.criminal_case.department_name) && (
                        <div className={styles.criminalBlock}>
                          <div className={styles.blockHeader}>Передача материалов</div>
                          <Row gutter={[16, 16]}>
                            {addition.criminal_case.transfer_date && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Дата передачи в ПРоО</div>
                                  <div className={styles.fieldValue}>{dayjs(addition.criminal_case.transfer_date).format("DD.MM.YYYY")}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.document_number && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Номер документа/КУСП</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.document_number}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.department_name && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Подразделение</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.department_name}</div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}

                      {/* Рассмотрение материалов */}
                      {(addition.criminal_case.review_result || addition.criminal_case.rejection_date || addition.criminal_case.rejection_reason || addition.criminal_case.appeal_date) && (
                        <div className={styles.criminalBlock}>
                          <div className={styles.blockHeader}>Рассмотрение материалов</div>
                          <Row gutter={[16, 16]}>
                            {addition.criminal_case.review_result && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Результат рассмотрения</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.review_result}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.rejection_date && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Дата отказа в ВУД/ВАД</div>
                                  <div className={styles.fieldValue}>{dayjs(addition.criminal_case.rejection_date).format("DD.MM.YYYY")}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.rejection_reason && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Причина отказа</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.rejection_reason}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.appeal_date && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Дата обжалования отказа</div>
                                  <div className={styles.fieldValue}>{dayjs(addition.criminal_case.appeal_date).format("DD.MM.YYYY")}</div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}

                      {/* Возбуждение дела */}
                      {(addition.criminal_case.case_date || addition.criminal_case.case_number || addition.criminal_case.law_article || addition.criminal_case.initiator || addition.criminal_case.subject || addition.criminal_case.detained_count) && (
                        <div className={styles.criminalBlock}>
                          <div className={styles.blockHeader}>Возбуждение дела</div>
                          <Row gutter={[16, 16]}>
                            {addition.criminal_case.case_date && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Дата ВУД/ВАД</div>
                                  <div className={styles.fieldValue}>{dayjs(addition.criminal_case.case_date).format("DD.MM.YYYY")}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.case_number && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Номер УД/АД</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.case_number}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.law_article && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Статья УК РФ/КоАП РФ</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.law_article}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.initiator && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Инициатор возбуждения</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.initiator}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.subject && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Субъект преступления</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.subject}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.detained_count && addition.criminal_case.detained_count > 0 && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Задержано</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.detained_count} чел.</div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}

                      {/* Привлекаемое лицо */}
                      {addition.criminal_case.person_name && (
                        <div className={styles.criminalBlock}>
                          <div className={styles.blockHeader}>Привлекаемое лицо</div>
                          <Row gutter={[16, 16]}>
                            <Col xs={24}>
                              <div className={styles.field}>
                                <div className={styles.fieldLabel}>ФИО лица/название юр.лица</div>
                                <div className={styles.fieldValue}>{addition.criminal_case.person_name}</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Результаты */}
                      {(addition.criminal_case.case_result || addition.criminal_case.court_decision || addition.criminal_case.convicted_count) && (
                        <div className={styles.criminalBlock}>
                          <div className={styles.blockHeader}>Результаты</div>
                          <Row gutter={[16, 16]}>
                            {addition.criminal_case.case_result && (
                              <Col xs={24}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Результат рассмотрения УД/АД</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.case_result}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.court_decision && (
                              <Col xs={24}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Решение суда</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.court_decision}</div>
                                </div>
                              </Col>
                            )}
                            {addition.criminal_case.convicted_count && addition.criminal_case.convicted_count > 0 && (
                              <Col xs={24} sm={12} lg={8}>
                                <div className={styles.field}>
                                  <div className={styles.fieldLabel}>Осуждено</div>
                                  <div className={styles.fieldValue}>{addition.criminal_case.convicted_count} чел.</div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Наказание */}
                  {addition.punishment && (
                    <div className={styles.subSection}>
                      <Title level={5} className={styles.subSectionTitle}>Наказание</Title>
                      <Row gutter={[16, 16]}>
                        {addition.punishment.guilty_persons_count !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Установлено виновных лиц</div>
                              <div className={styles.fieldValue}>{addition.punishment.guilty_persons_count}</div>
                            </div>
                          </Col>
                        )}
                        {addition.punishment.measures_taken_count !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Принято мер к виновным лицам</div>
                              <div className={styles.fieldValue}>{addition.punishment.measures_taken_count}</div>
                            </div>
                          </Col>
                        )}
                        {addition.punishment.warning_letter_rp398 !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Предупреждение по РП-398</div>
                              <div className={styles.fieldValue}>{addition.punishment.warning_letter_rp398}</div>
                            </div>
                          </Col>
                        )}
                        {addition.punishment.remark !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Замечание</div>
                              <div className={styles.fieldValue}>{addition.punishment.remark}</div>
                            </div>
                          </Col>
                        )}
                        {addition.punishment.reprimand !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Выговор</div>
                              <div className={styles.fieldValue}>{addition.punishment.reprimand}</div>
                            </div>
                          </Col>
                        )}
                        {addition.punishment.dismissed_count !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Уволено</div>
                              <div className={styles.fieldValue}>{addition.punishment.dismissed_count}</div>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}

                  {/* Финансовый ущерб */}
                  {(addition.detected_damage !== undefined || addition.prevented_damage !== undefined || addition.recovered_damage !== undefined) && (
                    <div className={styles.subSection}>
                      <Title level={5} className={styles.subSectionTitle}>Финансовый ущерб</Title>
                      <Row gutter={[16, 16]}>
                        {addition.detected_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Выявленный ущерб</div>
                              <div className={`${styles.fieldValue} ${styles.amountValue}`}>{addition.detected_damage ? `${addition.detected_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                            </div>
                          </Col>
                        )}
                        {addition.prevented_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Предотвращенный ущерб</div>
                              <div className={`${styles.fieldValue} ${styles.amountValue}`}>{addition.prevented_damage ? `${addition.prevented_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                            </div>
                          </Col>
                        )}
                        {addition.recovered_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <div className={styles.field}>
                              <div className={styles.fieldLabel}>Возмещенный ущерб</div>
                              <div className={`${styles.fieldValue} ${styles.amountValue}`}>{addition.recovered_damage ? `${addition.recovered_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}

                  {index < (incident.additionally?.length || 0) - 1 ? <Divider style={{ margin: '32px 0' }} /> : null}
                </div>
              ))}
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};
