import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Typography, Spin, Row, Col, Tag, Descriptions } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { ERoutes } from "../../enums/routes";
import dayjs from "dayjs";
import styles from "./EventView.module.scss";
import { PrimaryButton } from "../../components/PrimaryButton";
import { selectCanUpdateEvent } from "../../store/features/permissions/selectors";

const { Title, Text } = Typography;

export const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEvent(id);
  const canUpdateEvent = useSelector(selectCanUpdateEvent);

  const handleBack = () => {
    navigate(ERoutes.EVENTS_LIST);
  };

  const handleEdit = () => {
    navigate(`${ERoutes.EVENT_CREATE}/${id}`);
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

  if (!event) {
    return (
      <div className={styles.container}>
        <Card>
          <Title level={3}>Событие не найдено</Title>
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
              Событие {event.code || `#${event.id}`}
            </Title>
            {canUpdateEvent && (
              <PrimaryButton
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Редактировать
              </PrimaryButton>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* Основная информация */}
          <Card title="Основная информация" className={styles.sectionCard}>
            <Descriptions column={2} size="middle">
              <Descriptions.Item label="ID события">
                <Text strong>{event.code || `#${event.id}`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {dayjs(event.createdAt).format("DD.MM.YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Подразделение">
                <Tag color="blue">{event.department?.title || "Не указано"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дата события">
                {event.date ? dayjs(event.date).format("DD.MM.YYYY") : "-"}
              </Descriptions.Item>
              {event.entry_date && (
                <Descriptions.Item label="Дата внесения">
                  {dayjs(event.entry_date).format("DD.MM.YYYY")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Тип события">
                {event.is_service_investigation && (
                  <Tag color="green">Служебные расследования</Tag>
                )}
                {event.is_service_investigation_ib && (
                  <Tag color="green">Служебные расследования ИБ</Tag>
                )}
                {event.is_service_investigation_bpio && (
                  <Tag color="green">Служебные расследования БПиО</Tag>
                )}
                {event.is_service_investigation_bpio_hotline && (
                  <Tag color="green">Служебные расследования БПиО (горячая линия)</Tag>
                )}
                {event.is_service_check && (
                  <Tag color="green">Служебные проверки</Tag>
                )}
                {event.is_service_check_ib && (
                  <Tag color="green">Служебные проверки ИБ</Tag>
                )}
                {event.is_service_check_bpio && (
                  <Tag color="green">Служебная проверка БПиО</Tag>
                )}
                {event.is_service_check_bpio_hotline && (
                  <Tag color="green">Служебная проверка БПиО (горячая линия)</Tag>
                )}
                {event.is_verification_activity && (
                  <Tag color="green">Проверочные мероприятия</Tag>
                )}
                {!event.is_service_investigation && !event.is_service_investigation_ib && !event.is_service_investigation_bpio && !event.is_service_investigation_bpio_hotline && !event.is_service_check && !event.is_service_check_ib && !event.is_service_check_bpio && !event.is_service_check_bpio_hotline && !event.is_verification_activity && (
                  <Tag color="default">Не указан</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Особо важно">
                <Tag color={event.is_db ? "red" : "default"}>
                  {event.is_db ? "Да (1ДБ)" : "Нет"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Описание */}
          {event.description && (
            <Card title="Описание" className={styles.sectionCard}>
              <Text>{event.description}</Text>
            </Card>
          )}

          {/* Финансовые показатели */}
          {(event.detected_damage !== undefined || event.recovered_damage !== undefined || event.prevented_damage !== undefined || event.additional_income !== undefined || event.reduced_cost !== undefined || event.prevented_unnecessary_writeoff !== undefined || event.vat_deducted !== undefined) && (
            <Card title="Финансовые показатели" className={styles.sectionCard}>
              <Row gutter={[16, 16]}>
                {event.detected_damage !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Выявлен ущерб (руб.)</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.detected_damage ? `${event.detected_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.recovered_damage !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Возмещен ущерб (руб.)</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.recovered_damage ? `${event.recovered_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.prevented_damage !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Предотвращен ущерб (руб.)</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.prevented_damage ? `${event.prevented_damage.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.additional_income !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Получен дополнительный доход (руб.)</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.additional_income ? `${event.additional_income.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.reduced_cost !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Снижена стоимость товаров, работ и услуг на сумму (руб.)</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.reduced_cost ? `${event.reduced_cost.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.prevented_unnecessary_writeoff !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Предотвращено необ. списание ДЗ, руб.</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.prevented_unnecessary_writeoff ? `${event.prevented_unnecessary_writeoff.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
                {event.vat_deducted !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Принят к вычету НДС, руб.</div>
                      <div className={`${styles.fieldValue} ${styles.amountValue}`}>{event.vat_deducted ? `${event.vat_deducted.toLocaleString()} ₽` : "0 ₽"}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Уголовное дело */}
          {event.criminal_case && (
            <Card title="Уголовное дело" className={styles.sectionCard}>
              {/* Передача материалов */}
              {(event.criminal_case.transfer_date || event.criminal_case.document_number || event.criminal_case.department_name) && (
                <div className={styles.criminalBlock}>
                  <div className={styles.blockHeader}>Передача материалов</div>
                  <Row gutter={[16, 16]}>
                    {event.criminal_case.transfer_date && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Дата передачи в ПРоО</div>
                          <div className={styles.fieldValue}>{dayjs(event.criminal_case.transfer_date).format("DD.MM.YYYY")}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.document_number && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Номер документа/КУСП</div>
                          <div className={styles.fieldValue}>{event.criminal_case.document_number}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.department_name && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Подразделение</div>
                          <div className={styles.fieldValue}>{event.criminal_case.department_name}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Рассмотрение материалов */}
              {(event.criminal_case.review_result || event.criminal_case.rejection_date || event.criminal_case.rejection_reason || event.criminal_case.appeal_date) && (
                <div className={styles.criminalBlock}>
                  <div className={styles.blockHeader}>Рассмотрение материалов</div>
                  <Row gutter={[16, 16]}>
                    {event.criminal_case.review_result && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Результат рассмотрения</div>
                          <div className={styles.fieldValue}>{event.criminal_case.review_result}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.rejection_date && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Дата отказа в ВУД/ВАД</div>
                          <div className={styles.fieldValue}>{dayjs(event.criminal_case.rejection_date).format("DD.MM.YYYY")}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.rejection_reason && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Причина отказа</div>
                          <div className={styles.fieldValue}>{event.criminal_case.rejection_reason}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.appeal_date && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Дата обжалования отказа</div>
                          <div className={styles.fieldValue}>{dayjs(event.criminal_case.appeal_date).format("DD.MM.YYYY")}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Возбуждение дела */}
              {(event.criminal_case.case_date || event.criminal_case.case_number || event.criminal_case.law_article || event.criminal_case.initiator || event.criminal_case.subject || event.criminal_case.detained_count) && (
                <div className={styles.criminalBlock}>
                  <div className={styles.blockHeader}>Возбуждение дела</div>
                  <Row gutter={[16, 16]}>
                    {event.criminal_case.case_date && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Дата ВУД/ВАД</div>
                          <div className={styles.fieldValue}>{dayjs(event.criminal_case.case_date).format("DD.MM.YYYY")}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.case_number && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Номер УД/АД</div>
                          <div className={styles.fieldValue}>{event.criminal_case.case_number}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.law_article && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Статья УК РФ/КоАП РФ</div>
                          <div className={styles.fieldValue}>{event.criminal_case.law_article}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.initiator && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Инициатор возбуждения</div>
                          <div className={styles.fieldValue}>{event.criminal_case.initiator}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.subject && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Субъект преступления</div>
                          <div className={styles.fieldValue}>{event.criminal_case.subject}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.detained_count && event.criminal_case.detained_count > 0 && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Задержано</div>
                          <div className={styles.fieldValue}>{event.criminal_case.detained_count} чел.</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Привлекаемое лицо */}
              {event.criminal_case.person_name && (
                <div className={styles.criminalBlock}>
                  <div className={styles.blockHeader}>Привлекаемое лицо</div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <div className={styles.field}>
                        <div className={styles.fieldLabel}>ФИО лица/название юр.лица</div>
                        <div className={styles.fieldValue}>{event.criminal_case.person_name}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Результаты */}
              {(event.criminal_case.case_result || event.criminal_case.court_decision || event.criminal_case.convicted_count) && (
                <div className={styles.criminalBlock}>
                  <div className={styles.blockHeader}>Результаты</div>
                  <Row gutter={[16, 16]}>
                    {event.criminal_case.case_result && (
                      <Col xs={24}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Результат рассмотрения УД/АД</div>
                          <div className={styles.fieldValue}>{event.criminal_case.case_result}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.court_decision && (
                      <Col xs={24}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Решение суда</div>
                          <div className={styles.fieldValue}>{event.criminal_case.court_decision}</div>
                        </div>
                      </Col>
                    )}
                    {event.criminal_case.convicted_count && event.criminal_case.convicted_count > 0 && (
                      <Col xs={24} sm={12} lg={8}>
                        <div className={styles.field}>
                          <div className={styles.fieldLabel}>Осуждено</div>
                          <div className={styles.fieldValue}>{event.criminal_case.convicted_count} чел.</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </Card>
          )}

          {/* Наказание */}
          {event.punishment && (
            <Card title="Наказание" className={styles.sectionCard}>
              <Row gutter={[16, 16]}>
                {event.punishment.guilty_persons_count !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Установлено виновных лиц</div>
                      <div className={styles.fieldValue}>{event.punishment.guilty_persons_count}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.employees_involved_count !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Установлено сотрудников, причастных к инциденту</div>
                      <div className={styles.fieldValue}>{event.punishment.employees_involved_count}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.detained_persons_count !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Задержаны лица при совершении правонарушения</div>
                      <div className={styles.fieldValue}>{event.punishment.detained_persons_count}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.measures_taken_count !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Принято мер к виновным лицам</div>
                      <div className={styles.fieldValue}>{event.punishment.measures_taken_count}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.warning_letter_rp398 !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Предупреждение по РП-398</div>
                      <div className={styles.fieldValue}>{event.punishment.warning_letter_rp398}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.remark !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Замечание</div>
                      <div className={styles.fieldValue}>{event.punishment.remark}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.reprimand !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Выговор</div>
                      <div className={styles.fieldValue}>{event.punishment.reprimand}</div>
                    </div>
                  </Col>
                )}
                {event.punishment.dismissed_count !== undefined && (
                  <Col xs={24} sm={12} lg={8}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Уволено</div>
                      <div className={styles.fieldValue}>{event.punishment.dismissed_count}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

