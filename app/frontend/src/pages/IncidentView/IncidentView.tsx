import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Spin, Space, Divider, Row, Col, Tag, Descriptions } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { ERoutes } from "../../enums/routes";
import { EIncidentDirection } from "../../enums/incident";
import dayjs from "dayjs";
import styles from "./IncidentView.module.scss";

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
          <Button onClick={handleBack}>Вернуться на главную</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.mainCard}>
        <div className={styles.header}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div className={styles.headerTop}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                className={styles.backButton}
              >
                Назад
              </Button>
              <Title level={2} className={styles.title}>
                Инцидент #{incident.id}
              </Title>
            </div>
            
            <div className={styles.headerActions}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Редактировать
              </Button>
            </div>
          </Space>
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
                  </Row>
                  {index < (incident.addresses?.length || 0) - 1 && <Divider />}
                </div>
              ))}
            </Card>
          )}

          {/* Персональные данные */}
          {incident.persons && incident.persons?.length > 0 && (
            <Card title="Персональные данные" className={styles.sectionCard}>
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
                  {index < (incident.persons?.length || 0) - 1 && <Divider />}
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
                      {addition.incident_date && (
                        <Descriptions.Item label="Дата происшествия">
                          {dayjs(addition.incident_date).format("DD.MM.YYYY")}
                        </Descriptions.Item>
                      )}
                      {addition.addition_date && (
                        <Descriptions.Item label="Дата внесения дополнения">
                          {dayjs(addition.addition_date).format("DD.MM.YYYY")}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </div>

                  {/* Описание */}
                  {addition.text_field && (
                    <div className={styles.subSection}>
                      <Title level={5}>Описание</Title>
                      <Text>{addition.text_field}</Text>
                    </div>
                  )}

                  {/* Уголовные дела */}
                  {addition.criminal_cases_list && addition.criminal_cases_list.length > 0 && (
                    <div className={styles.subSection}>
                      <Title level={5}>Уголовные дела</Title>
                      {addition.criminal_cases_list.map((crimCase, ccIndex) => (
                        <Card key={ccIndex} size="small" className={styles.nestedCard} title={`Уголовное дело ${ccIndex + 1}`}>
                          <Row gutter={[16, 8]}>
                            {crimCase.transfer_date && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Дата передачи:</Text> {dayjs(crimCase.transfer_date).format("DD.MM.YYYY")}
                              </Col>
                            )}
                            {crimCase.document_number && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Номер документа:</Text> {crimCase.document_number}
                              </Col>
                            )}
                            {crimCase.department_name && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Подразделение:</Text> {crimCase.department_name}
                              </Col>
                            )}
                            {crimCase.case_number && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Номер дела:</Text> {crimCase.case_number}
                              </Col>
                            )}
                            {crimCase.law_article && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Статья закона:</Text> {crimCase.law_article}
                              </Col>
                            )}
                            {crimCase.review_result && (
                              <Col xs={24}>
                                <Text strong>Результат рассмотрения:</Text> {crimCase.review_result}
                              </Col>
                            )}
                          </Row>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Наказания */}
                  {addition.punishments && addition.punishments.length > 0 && (
                    <div className={styles.subSection}>
                      <Title level={5}>Наказания</Title>
                      {addition.punishments.map((punishment, pIndex) => (
                        <Card key={pIndex} size="small" className={styles.nestedCard} title={`Наказание ${pIndex + 1}`}>
                          <Row gutter={[16, 8]}>
                            <Col xs={24} sm={12} lg={8}>
                              <Text strong>Тип наказания:</Text> {punishment.punishment_type_id}
                            </Col>
                            {punishment.date && (
                              <Col xs={24} sm={12} lg={8}>
                                <Text strong>Дата наказания:</Text> {dayjs(punishment.date).format("DD.MM.YYYY")}
                              </Col>
                            )}
                            <Col xs={24} sm={12} lg={8}>
                              <Text strong>Количество уволенных:</Text> {punishment.fired_count}
                            </Col>
                            {punishment.description && (
                              <Col xs={24}>
                                <Text strong>Описание:</Text> {punishment.description}
                              </Col>
                            )}
                          </Row>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Финансовый ущерб */}
                  {(addition.detected_damage || addition.prevented_damage || addition.recovered_damage) && (
                    <div className={styles.subSection}>
                      <Title level={5}>Финансовый ущерб</Title>
                      <Row gutter={[16, 8]}>
                        {addition.detected_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <Text strong>Выявленный ущерб:</Text> {addition.detected_damage ? `${addition.detected_damage.toLocaleString()} ₽` : "0 ₽"}
                          </Col>
                        )}
                        {addition.prevented_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <Text strong>Предотвращенный ущерб:</Text> {addition.prevented_damage ? `${addition.prevented_damage.toLocaleString()} ₽` : "0 ₽"}
                          </Col>
                        )}
                        {addition.recovered_damage !== undefined && (
                          <Col xs={24} sm={12} lg={8}>
                            <Text strong>Возмещенный ущерб:</Text> {addition.recovered_damage ? `${addition.recovered_damage.toLocaleString()} ₽` : "0 ₽"}
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}

                  {index < (incident.additionally?.length || 0) - 1 && <Divider style={{ margin: '32px 0' }} />}
                </div>
              ))}
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};
