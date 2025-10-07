import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Spin, Space, Divider, Row, Col, Tag, Descriptions, message } from "antd";
import { ArrowLeftOutlined, EditOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { ERoutes } from "../../enums/routes";
import { EIncidentDirection } from "../../enums/incident";
import { ExportService } from "../../services/export";
import dayjs from "dayjs";
import styles from "./IncidentView.module.scss";

const { Title, Text } = Typography;

export const IncidentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: incident, isLoading } = useGetIncident(id);

  const handleBack = () => {
    navigate(ERoutes.HOME);
  };

  const handleEdit = () => {
    navigate(`${ERoutes.INCIDENT_CREATE}/${id}`);
  };

  const handleExportPDF = async () => {
    if (incident) {
      try {
        await ExportService.exportToPDF(incident);
        message.success('PDF документ успешно экспортирован');
      } catch (error) {
        console.error('Ошибка при экспорте в PDF:', error);
        message.error('Ошибка при экспорте в PDF');
      }
    }
  };

  const handleExportDOCX = async () => {
    if (incident) {
      try {
        console.log('Начинаем экспорт DOCX для инцидента:', incident.id);
        await ExportService.exportToDOCX(incident);
        console.log('DOCX экспорт завершен успешно');
        message.success('DOCX документ успешно экспортирован');
      } catch (error) {
        console.error('Ошибка при экспорте в DOCX:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error('Детали ошибки:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        message.error(`Ошибка при экспорте в DOCX: ${errorMessage}`);
      }
    }
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
              <Space>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Редактировать
                </Button>
                <Button 
                  icon={<FilePdfOutlined />}
                  onClick={handleExportPDF}
                >
                  Экспорт PDF
                </Button>
                <Button 
                  icon={<FileWordOutlined />}
                  onClick={handleExportDOCX}
                >
                  Экспорт DOCX
                </Button>
              </Space>
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
                <Tag color="purple">{incident.object_type_id ? `ID: ${incident.object_type_id}` : "Не указан"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дело безопасности">
                <Tag color={incident.is_db ? "red" : "default"}>
                  {incident.is_db ? "Да (1-ДБ)" : "Нет"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Информация о событиях */}
          {incident.events && incident.events.length > 0 && (
            <Card title="Информация о событиях" className={styles.sectionCard}>
              <Descriptions column={2} size="middle">
                <Descriptions.Item label="Типы событий">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {incident.events.map((event, index) => (
                      <Tag key={index} color="blue">
                        {event.event_type?.title}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Дата события">
                  {dayjs(incident.events[0].date).format("DD.MM.YYYY")}
                </Descriptions.Item>
                {incident.events[0].entry_date && (
                  <Descriptions.Item label="Дата внесения">
                    {dayjs(incident.events[0].entry_date).format("DD.MM.YYYY")}
                  </Descriptions.Item>
                )}
                {incident.events[0].description && (
                  <Descriptions.Item label="Описание" span={2}>
                    {incident.events[0].description}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Адрес */}
              {(incident.events[0].city || incident.events[0].street || incident.events[0].house || incident.events[0].building) && (
                <>
                  <Divider orientation="left" plain>Адрес</Divider>
                  <Row gutter={[16, 8]}>
                    {incident.events[0].city && (
                      <Col span={6}>
                        <Text strong>Город:</Text> {incident.events[0].city}
                      </Col>
                    )}
                    {incident.events[0].street && (
                      <Col span={6}>
                        <Text strong>Улица:</Text> {incident.events[0].street}
                      </Col>
                    )}
                    {incident.events[0].house && (
                      <Col span={6}>
                        <Text strong>Дом:</Text> {incident.events[0].house}
                      </Col>
                    )}
                    {incident.events[0].building && (
                      <Col span={6}>
                        <Text strong>Корпус:</Text> {incident.events[0].building}
                      </Col>
                    )}
                  </Row>
                </>
              )}

              {/* Персональные данные */}
              {(incident.events[0].last_name || incident.events[0].first_name || incident.events[0].middle_name || incident.events[0].employee_number) && (
                <>
                  <Divider orientation="left" plain>Персональные данные</Divider>
                  <Row gutter={[16, 8]}>
                    {incident.events[0].last_name && (
                      <Col span={6}>
                        <Text strong>Фамилия:</Text> {incident.events[0].last_name}
                      </Col>
                    )}
                    {incident.events[0].first_name && (
                      <Col span={6}>
                        <Text strong>Имя:</Text> {incident.events[0].first_name}
                      </Col>
                    )}
                    {incident.events[0].middle_name && (
                      <Col span={6}>
                        <Text strong>Отчество:</Text> {incident.events[0].middle_name}
                      </Col>
                    )}
                    {incident.events[0].employee_number && (
                      <Col span={6}>
                        <Text strong>Табельный номер:</Text> {incident.events[0].employee_number}
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </Card>
          )}

          {/* Дополнительная информация */}
          {incident.additionally && incident.additionally.length > 0 && (
            <Card title="Дополнительная информация" className={styles.sectionCard}>
              {incident.additionally.map((addition, index) => (
                <div key={addition.id || index} className={styles.additionItem}>
                  <Title level={4}>Дополнение #{index + 1}</Title>
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
                    {addition.criminal_cases && (
                      <Descriptions.Item label="Уголовные дела" span={2}>
                        {addition.criminal_cases}
                      </Descriptions.Item>
                    )}
                    {addition.text_field && (
                      <Descriptions.Item label="Описание" span={2}>
                        {addition.text_field}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Наказано">
                      <Tag color={addition.is_punished ? "red" : "green"}>
                        {addition.is_punished ? "Да" : "Нет"}
                      </Tag>
                    </Descriptions.Item>
                    {(addition.detected_damage || addition.prevented_damage || addition.recovered_damage) && (
                      <>
                        <Descriptions.Item label="Выявленный ущерб">
                          {addition.detected_damage ? `${addition.detected_damage} руб.` : "Не указан"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Предотвращенный ущерб">
                          {addition.prevented_damage ? `${addition.prevented_damage} руб.` : "Не указан"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Возмещенный ущерб">
                          {addition.recovered_damage ? `${addition.recovered_damage} руб.` : "Не указан"}
                        </Descriptions.Item>
                      </>
                    )}
                  </Descriptions>
                  {index < (incident.additionally?.length || 0) - 1 && <Divider />}
                </div>
              ))}
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};
