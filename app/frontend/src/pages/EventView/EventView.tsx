import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Descriptions,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { ERoutes } from "../../enums/routes";
import {
  EventDirectionLabels,
  getCategoryLabel,
} from "../../enums/event";
import dayjs from "dayjs";
import styles from "./EventView.module.scss";

const { Title } = Typography;

export const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEvent(id);

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
          <p>Событие не найдено</p>
          <Button onClick={handleBack}>Назад к списку</Button>
        </Card>
      </div>
    );
  }

  const getDirectionColor = (direction: string) => {
    if (direction === 'INFORMATION') return 'blue';
    if (direction === 'ECONOMIC') return 'green';
    if (direction === 'SECURITY') return 'orange';
    return 'default';
  };

  // Функция для рендеринга значения поля
  const renderFieldValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Не указано</span>;
    }
    return value;
  };

  // Функция для рендеринга числового поля с суммой
  const renderMoneyField = (value: any) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>0.00 руб.</span>;
    }
    return `${Number(value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб.`;
  };

  // Функция для рендеринга числового поля
  const renderNumberField = (value: any) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>0</span>;
    }
    return Number(value).toLocaleString('ru-RU');
  };

  // Функция для получения всех непустых полей события
  const getEventFields = () => {
    const fields: Array<{ label: string; value: any }> = [];
    
    // Полный маппинг всех полей для всех категорий
    const fieldMappings: Record<string, Array<{ key: string; label: string; type?: 'money' | 'number' | 'text' }>> = {
      // ЭБ - DEBT_RECOVERY
      'DEBT_RECOVERY': [
        { key: 'total_debt', label: 'Общий размер ДЗ', type: 'money' },
        { key: 'overdue_debt', label: 'Размер просроченной ДЗ', type: 'money' },
        { key: 'overdue_debt_sb', label: 'ПДЗ, переданная в СБ', type: 'money' },
        { key: 'recovered_debt', label: 'Взыскано ДЗ', type: 'money' },
        { key: 'available_vat', label: 'Доступный к возмещению НДС', type: 'money' },
        { key: 'vat_assistance', label: 'Содействие в получении НДС', type: 'money' },
        { key: 'written_off_debt', label: 'Размер списанной ДЗ', type: 'money' },
        { key: 'prevented_writeoff', label: 'Предотвращено списания ДЗ', type: 'money' },
      ],
      // ЭБ - LAW_ENFORCEMENT
      'LAW_ENFORCEMENT': [
        { key: 'incoming_requests', label: 'Поступило входящих запросов ПОО', type: 'number' },
        { key: 'executed_requests', label: 'Исполнено запросов ПОО', type: 'number' },
        { key: 'executed_tasks', label: 'Исполнено заданий в запросах', type: 'number' },
        { key: 'received_presentations', label: 'Поступило представлений ПОО', type: 'number' },
        { key: 'executed_presentations', label: 'Исполнено представлений', type: 'number' },
      ],
      // ЭБ - INVESTMENT_CONTROL
      'INVESTMENT_CONTROL': [
        { key: 'checked_entities_new', label: 'Проверено юр./физ.лиц (новые)', type: 'number' },
        { key: 'negative_conclusions_new', label: 'Отрицательных заключений (новые)', type: 'number' },
        { key: 'checked_entities_active', label: 'Проверено контрагентов (действующие)', type: 'number' },
        { key: 'negative_conclusions_active', label: 'Отрицательных заключений (действующие)', type: 'number' },
        { key: 'checked_draft_contracts', label: 'Проверено проектов договоров', type: 'number' },
        { key: 'not_approved_drafts', label: 'Не согласовано (проекты)', type: 'number' },
        { key: 'checked_active_contracts', label: 'Проверено действующих договоров', type: 'number' },
        { key: 'not_approved_active', label: 'Не согласовано (действующие)', type: 'number' },
        { key: 'planned_budget', label: 'Бюджет закупок на год', type: 'money' },
        { key: 'procurement_procedures_count', label: 'Проведено закупок', type: 'number' },
        { key: 'single_source_count', label: 'Единственный источник (кол-во)', type: 'number' },
        { key: 'procurement_procedures_sum', label: 'Закупки на сумму', type: 'money' },
        { key: 'single_source_sum', label: 'Единственный источник (сумма)', type: 'money' },
        { key: 'cost_reduction', label: 'Снижена стоимость', type: 'money' },
      ],
      // ЭБ - AFFILIATION
      'AFFILIATION': [
        { key: 'checked_employees', label: 'Проверено сотрудников', type: 'number' },
        { key: 'found_affiliated', label: 'Выявлено аффилированных', type: 'number' },
        { key: 'checked_candidates', label: 'Проверено кандидатов', type: 'number' },
        { key: 'rejected_candidates', label: 'Отклонено кандидатов', type: 'number' },
        { key: 'rejected_affiliated', label: 'Отклонено по аффилированности', type: 'number' },
      ],
      // ЭБ - CITIZEN_APPEALS
      'CITIZEN_APPEALS': [
        { key: 'total_appeals', label: 'Всего обращений', type: 'number' },
        { key: 'zon_applications', label: 'Заявлений о непричастности (ЗОН)', type: 'number' },
        { key: 'fictitious_contracts', label: 'Выявлено фиктивных договоров', type: 'number' },
        { key: 'termination_requests', label: 'Заявлений о расторжении', type: 'number' },
        { key: 'beautiful_numbers', label: 'Запросов на красивые номера', type: 'number' },
        { key: 'sim_replacement', label: 'Заявлений о замене SIM', type: 'number' },
        { key: 'refund_requests', label: 'Заявлений о возврате платежа', type: 'number' },
        { key: 'other_appeals', label: 'Прочих заявлений', type: 'number' },
      ],
      // ИБ - INSPECTIONS
      'INSPECTIONS': [
        { key: 'ib_incident_checks', label: 'Проверок по инцидентам ИБ', type: 'number' },
        { key: 'planned_ib_checks', label: 'Плановых проверок ИБ', type: 'number' },
        { key: 'non_compliances', label: 'Несоответствий нормативам', type: 'number' },
      ],
      // ИБ - VIOLATORS_MEASURES
      'VIOLATORS_MEASURES': [
        { key: 'warnings', label: 'Предупреждений', type: 'number' },
        { key: 'remarks', label: 'Замечаний', type: 'number' },
        { key: 'reprimands', label: 'Выговоров', type: 'number' },
        { key: 'dismissals', label: 'Увольнений', type: 'number' },
      ],
      // ИБ - ACCESS_APPROVALS
      'ACCESS_APPROVALS': [
        { key: 'approved_accesses', label: 'Согласовано доступов', type: 'number' },
      ],
      // ИБ - MEMOS_PREPARED
      'MEMOS_PREPARED': [
        { key: 'memos_count', label: 'Подготовлено служебных записок', type: 'number' },
      ],
      // ИБ - RISK_MINIMIZATION
      'RISK_MINIMIZATION': [
        { key: 'audit_description', label: 'Описание проводимых работ', type: 'text' },
        { key: 'scanned_count', label: 'Проведено/просканировано', type: 'number' },
        { key: 'vulnerabilities_found', label: 'Выявлено уязвимостей', type: 'number' },
      ],
      // ИБ - CT_KI_PROTECTION
      'CT_KI_PROTECTION': [
        { key: 'ct_ki_description', label: 'Описание проведенных работ', type: 'text' },
        { key: 'confidential_docs', label: 'Зарегистрировано документов', type: 'number' },
        { key: 'compliance_checks', label: 'Проведено проверок', type: 'number' },
      ],
      // ИБ - AWARENESS_RAISING
      'AWARENESS_RAISING': [
        { key: 'awareness_description', label: 'Описание проведенных работ', type: 'text' },
      ],
      // ИБ - ACCESS_CONTROL
      'ACCESS_CONTROL': [
        { key: 'access_control_description', label: 'Описание проведенных работ', type: 'text' },
        { key: 'access_requests', label: 'Рассмотрено заявок', type: 'number' },
        { key: 'access_violations', label: 'Нарушений доступа', type: 'number' },
        { key: 'account_audits', label: 'Аудитов учетных записей', type: 'number' },
        { key: 'violations_found', label: 'Выявлено нарушений', type: 'number' },
      ],
      // ИБ - INCIDENT_MONITORING
      'INCIDENT_MONITORING': [
        { key: 'processed_incidents', label: 'Обработано инцидентов ИБ', type: 'number' },
        { key: 'admin_rights_incidents', label: 'Нарушения админ. прав', type: 'number' },
        { key: 'kspd_access_incidents', label: 'Подозрения в доступе КСПД', type: 'number' },
        { key: 'spam_incidents', label: 'Спам-активность', type: 'number' },
        { key: 'virus_incidents', label: 'Вирусная активность', type: 'number' },
        { key: 'software_incidents', label: 'Некорпоративное ПО', type: 'number' },
        { key: 'ki_pdn_incidents', label: 'Нарушения КИ и ПДн', type: 'number' },
        { key: 'network_attacks_incidents', label: 'Сетевые атаки', type: 'number' },
        { key: 'leaks_found', label: 'Утечки КИ/КТ', type: 'number' },
        { key: 'blocked_threats', label: 'Заблокировано угроз', type: 'number' },
        { key: 'other_incidents', label: 'Другие инциденты', type: 'number' },
        { key: 'other_incidents_description', label: 'Описание других инцидентов', type: 'text' },
      ],
      // ИБ - FRAUD_PREVENTION
      'FRAUD_PREVENTION': [
        { key: 'fraud_incidents', label: 'Выявлено инцидентов фрода', type: 'number' },
        { key: 'fraud_description', label: 'Описание работ по противодействию фроду', type: 'text' },
      ],
      // ИБ - INFRASTRUCTURE_ANALYSIS
      'INFRASTRUCTURE_ANALYSIS': [
        { key: 'analyzed_documents', label: 'Обработано документов', type: 'number' },
      ],
      // ИБ - RISK_ANALYSIS
      'RISK_ANALYSIS': [
        { key: 'risk_analysis_description', label: 'Описание работ по оценке рисков', type: 'text' },
      ],
      // ИБ - PROJECT_ACTIVITIES
      'PROJECT_ACTIVITIES': [
        { key: 'project_status_description', label: 'Статус и описание проектных работ', type: 'text' },
        { key: 'normative_docs_list', label: 'Перечень нормативных документов', type: 'text' },
      ],
      // ИБ - SYSTEM_OPERATION
      'SYSTEM_OPERATION': [
        { key: 'support_contracts', label: 'Договоры на техподдержку', type: 'text' },
        { key: 'administration_activities', label: 'Операционная деятельность', type: 'text' },
        { key: 'other_administration', label: 'Другая деятельность', type: 'text' },
        { key: 'system_failures', label: 'Информация об авариях', type: 'text' },
      ],
      // ИБ - OTHER_ACTIVITIES
      'OTHER_ACTIVITIES': [
        { key: 'other_activities_description', label: 'Описание прочей деятельности', type: 'text' },
      ],
      // БПиО - STAFF_COUNT
      'STAFF_COUNT': [
        { key: 'staff_count', label: 'Количество сотрудников', type: 'number' },
      ],
      // БПиО - OBJECTS_COUNT
      'OBJECTS_COUNT': [
        { key: 'objects_physical_security', label: 'Под физической охраной', type: 'number' },
        { key: 'objects_panel_security', label: 'Под пультовой охраной', type: 'number' },
      ],
      // БПиО - CAPEX_BUDGET
      'CAPEX_BUDGET': [
        { key: 'capex_allocated', label: 'Выделенный бюджет на год', type: 'money' },
        { key: 'capex_spent_current', label: 'Освоение в текущем месяце', type: 'money' },
      ],
      // БПиО - OPEX_BUDGET
      'OPEX_BUDGET': [
        { key: 'opex_allocated', label: 'Выделенный бюджет на год', type: 'money' },
      ],
      // БПиО - ATZ_INSPECTIONS
      'ATZ_INSPECTIONS': [
        { key: 'atz_checks_pb', label: 'Сотрудниками ПБ ДЗК/ДЗО', type: 'number' },
        { key: 'atz_checks_law', label: 'Совместно с ПОО', type: 'number' },
      ],
      // БПиО - ATU_ATT
      'ATU_ATT': [
        { key: 'atu_att_pb', label: 'Сотрудниками ПБ', type: 'number' },
        { key: 'atu_att_law', label: 'Совместно с ПОО', type: 'number' },
      ],
      // БПиО - SECURITY_COMPANY
      'SECURITY_COMPANY': [
        { key: 'chop_checks', label: 'Проведено проверок несения службы', type: 'number' },
        { key: 'chop_claims', label: 'Подготовлено претензий', type: 'number' },
      ],
      // БПиО - INTRUSION
      'INTRUSION': [
        { key: 'intrusion_total', label: 'Всего случаев (попыток)', type: 'number' },
        { key: 'intrusion_not_prevented', label: 'Не предотвращенные', type: 'number' },
        { key: 'intrusion_prevented', label: 'Предотвращенные', type: 'number' },
        { key: 'intrusion_detained', label: 'Задержано лиц', type: 'number' },
        { key: 'intrusion_damage', label: 'Установленный ущерб', type: 'money' },
        { key: 'intrusion_prevented_damage', label: 'Предотвращенный ущерб', type: 'money' },
        { key: 'intrusion_recovered', label: 'Возмещенный ущерб', type: 'money' },
        { key: 'intrusion_employees', label: 'Сотрудников причастных', type: 'number' },
        { key: 'intrusion_penalties', label: 'Дисциплинарных взысканий', type: 'number' },
        { key: 'intrusion_dismissals', label: 'Уволено', type: 'number' },
        { key: 'intrusion_materials', label: 'Материалов в ПОО', type: 'number' },
        { key: 'intrusion_cases_opened', label: 'Возбуждено дел', type: 'number' },
        { key: 'intrusion_cases_closed', label: 'Окончено дел', type: 'number' },
      ],
      // БПиО - ATTACK
      'ATTACK': [
        { key: 'attack_total', label: 'Всего случаев (попыток)', type: 'number' },
        { key: 'attack_not_prevented', label: 'Не предотвращенные', type: 'number' },
        { key: 'attack_prevented', label: 'Предотвращенные', type: 'number' },
        { key: 'attack_detained', label: 'Задержано лиц', type: 'number' },
        { key: 'attack_damage', label: 'Установленный ущерб', type: 'money' },
        { key: 'attack_prevented_damage', label: 'Предотвращенный ущерб', type: 'money' },
        { key: 'attack_recovered', label: 'Возмещенный ущерб', type: 'money' },
        { key: 'attack_employees', label: 'Сотрудников причастных', type: 'number' },
        { key: 'attack_penalties', label: 'Дисциплинарных взысканий', type: 'number' },
        { key: 'attack_dismissals', label: 'Уволено', type: 'number' },
        { key: 'attack_materials', label: 'Материалов в ПОО', type: 'number' },
        { key: 'attack_cases_opened', label: 'Возбуждено дел', type: 'number' },
        { key: 'attack_cases_closed', label: 'Окончено дел', type: 'number' },
      ],
      // БПиО - INVESTIGATIONS
      'INVESTIGATIONS': [
        { key: 'investigations_count', label: 'Количество проверок и СР', type: 'number' },
      ],
    };

    const categoryFields = fieldMappings[event.category] || [];
    
    categoryFields.forEach(({ key, label, type }) => {
      const value = (event as any)[key];
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        fields.push({
          label,
          value: type === 'money' 
            ? renderMoneyField(value)
            : type === 'number'
            ? renderNumberField(value)
            : value
        });
      }
    });

    return fields;
  };

  const eventFields = getEventFields();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Заголовок и кнопки */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                size="large"
              >
                Назад
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Просмотр события #{event.id}
              </Title>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              size="large"
            >
              Редактировать
            </Button>
          </div>

          {/* Основная информация */}
          <Card title="Основная информация" className={styles.sectionCard}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID события">
                {event.id}
              </Descriptions.Item>
              <Descriptions.Item label="Подразделение">
                {event.department?.title || "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Период">
                {event.period_from && event.period_to
                  ? `${dayjs(event.period_from).format("DD.MM.YYYY")} - ${dayjs(event.period_to).format("DD.MM.YYYY")}`
                  : "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Направление">
                <Tag color={getDirectionColor(event.direction)}>
                  {EventDirectionLabels[event.direction] || event.direction}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Категория" span={2}>
                <Tag color="purple">{getCategoryLabel(event.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Создал">
                {event.created_by || "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {event.createdAt
                  ? dayjs(event.createdAt).format("DD.MM.YYYY HH:mm")
                  : "Не указано"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Данные события */}
          {eventFields.length > 0 && (
            <Card title="Данные события" className={styles.sectionCard}>
              <Descriptions column={1} bordered>
                {eventFields.map((field, index) => (
                  <Descriptions.Item key={index} label={field.label}>
                    {field.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}

          {eventFields.length === 0 && (
            <Card className={styles.sectionCard}>
              <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                Дополнительные данные не заполнены
              </p>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

