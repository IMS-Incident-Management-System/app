import { Form, Card, InputNumber, Input, Row, Col, Divider } from "antd";
import {
  EOperationalActivityCategoryEconomic,
  EOperationalActivityCategoryInformation,
  EOperationalActivityCategorySecurity,
  EOperationalActivityCategoryCyber,
} from "../../../../enums/operationalActivity";
import styles from "./CategoryFields.module.scss";

const { TextArea } = Input;

export const CategoryFields = () => {
  const form = Form.useFormInstance();
  const category = Form.useWatch("category", form);
  const direction = Form.useWatch("direction", form);

  if (!category || !direction) {
    return (
      <Card className={styles.card}>
        <p className={styles.hint}>
          Выберите направление и категорию для отображения полей
        </p>
      </Card>
    );
  }

  // ЭБ - Работа по возмещению ДЗ и НДС
  if (category === EOperationalActivityCategoryEconomic.DEBT_RECOVERY) {
    return (
      <Card className={styles.card} title="Работа по возмещению ДЗ и НДС">
        <div className={styles.formFields}>
          <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Общий размер ДЗ (руб.)" name="total_debt">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Размер просроченной ДЗ (руб.)" name="overdue_debt">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="ПДЗ, переданная в СБ (руб.)" name="overdue_debt_sb">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Взыскано ДЗ (руб.)" name="recovered_debt">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Доступный к возмещению НДС (руб.)" name="available_vat">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Содействие в получении НДС (руб.)" name="vat_assistance">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Размер списанной ДЗ (руб.)" name="written_off_debt">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Предотвращено списания ДЗ (руб.)" name="prevented_writeoff">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>
        </div>
      </Card>
    );
  }

  // ЭБ - Взаимодействие с правоохранительными органами (временно отключено)
  // if (category === EOperationalActivityCategoryEconomic.LAW_ENFORCEMENT) {
  //   return (
  //     <Card className={styles.card} title="Взаимодействие с правоохранительными органами">
  //       <div className={styles.formFields}>
  //         <Row gutter={[24, 16]}>
  //         <Col xs={24} sm={12} lg={8}>
  //           <Form.Item label="Поступило входящих запросов ПОО" name="incoming_requests">
  //             <InputNumber style={{ width: "100%" }} placeholder="0" />
  //           </Form.Item>
  //         </Col>
  //         <Col xs={24} sm={12} lg={8}>
  //           <Form.Item label="Исполнено запросов ПОО" name="executed_requests">
  //             <InputNumber style={{ width: "100%" }} placeholder="0" />
  //           </Form.Item>
  //         </Col>
  //         <Col xs={24} sm={12} lg={8}>
  //           <Form.Item label="Исполнено заданий в запросах" name="executed_tasks">
  //             <InputNumber style={{ width: "100%" }} placeholder="0" />
  //           </Form.Item>
  //         </Col>
  //         <Col xs={24} sm={12} lg={8}>
  //           <Form.Item label="Поступило представлений ПОО" name="received_presentations">
  //             <InputNumber style={{ width: "100%" }} placeholder="0" />
  //           </Form.Item>
  //         </Col>
  //         <Col xs={24} sm={12} lg={8}>
  //           <Form.Item label="Исполнено представлений" name="executed_presentations">
  //             <InputNumber style={{ width: "100%" }} placeholder="0" />
  //           </Form.Item>
  //         </Col>
  //       </Row>
  //       </div>
  //     </Card>
  //   );
  // }

  // ЭБ - Контроль инвестиционной, закупочной деятельности (сокращенная версия)
  if (category === EOperationalActivityCategoryEconomic.INVESTMENT_CONTROL) {
    return (
      <Card className={styles.card} title="Контроль инвестиционной, закупочной и договорной деятельности">
        <Divider orientation="left" plain>Проверка контрагентов</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено юр./физ.лиц (новые)" name="checked_entities_new">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Отрицательных заключений (новые)" name="negative_conclusions_new">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено контрагентов (действующие)" name="checked_entities_active">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Отрицательных заключений (действующие)" name="negative_conclusions_active">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Проверка договоров</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено проектов договоров" name="checked_draft_contracts">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Не согласовано (проекты)" name="not_approved_drafts">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено действующих договоров" name="checked_active_contracts">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Не согласовано (действующие)" name="not_approved_active">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Закупочная деятельность</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Бюджет закупок на год (руб.)" name="planned_budget">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проведено закупок (кол-во)" name="procurement_procedures_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Единственный источник (кол-во)" name="single_source_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Закупки на сумму (руб.)" name="procurement_procedures_sum">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Единственный источник (руб.)" name="single_source_sum">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Снижена стоимость (руб.)" name="cost_reduction">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ЭБ - Работа по выявлению аффилированности
  if (category === EOperationalActivityCategoryEconomic.AFFILIATION) {
    return (
      <Card className={styles.card} title="Работа по выявлению признаков аффилированности">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено сотрудников" name="checked_employees">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Выявлено аффилированных" name="found_affiliated">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Проверено кандидатов" name="checked_candidates">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Отклонено кандидатов" name="rejected_candidates">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Отклонено по аффилированности" name="rejected_affiliated">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ЭБ - Работа с обращениями граждан
  if (category === EOperationalActivityCategoryEconomic.CITIZEN_APPEALS) {
    return (
      <Card className={styles.card} title="Работа с обращениями граждан">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Всего обращений" name="total_appeals">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Заявлений о непричастности (ЗОН)" name="zon_applications">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Выявлено фиктивных договоров" name="fictitious_contracts">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Заявлений о расторжении" name="termination_requests">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Запросов на красивые номера" name="beautiful_numbers">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Заявлений о замене SIM" name="sim_replacement">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Заявлений о возврате платежа" name="refund_requests">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Прочих заявлений" name="other_appeals">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Сведения об участии в проверочных мероприятиях
  if (category === EOperationalActivityCategoryInformation.INSPECTIONS) {
    return (
      <Card className={styles.card} title="Сведения об участии в проверочных мероприятиях">
        <div className={styles.formFields}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Проверок по инцидентам ИБ" name="ib_incident_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Плановых проверок ИБ" name="planned_ib_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Несоответствий нормативам" name="non_compliances">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
    );
  }

  // ИБ - Меры к нарушителям
  if (category === EOperationalActivityCategoryInformation.VIOLATORS_MEASURES) {
    return (
      <Card className={styles.card} title="Меры, принятые к нарушителям">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Предупреждений" name="warnings">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Замечаний" name="remarks">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Выговоров" name="reprimands">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Увольнений" name="dismissals">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Количество согласованных доступов
  if (category === EOperationalActivityCategoryInformation.ACCESS_APPROVALS) {
    return (
      <Card className={styles.card} title="Количество согласованных доступов к информационным активам">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Согласовано доступов" name="approved_accesses">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Подготовлено служебных записок
  if (category === EOperationalActivityCategoryInformation.MEMOS_PREPARED) {
    return (
      <Card className={styles.card} title="Подготовлено служебных записок руководству">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Подготовлено служебных записок" name="memos_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Минимизация рисков и угроз
  if (category === EOperationalActivityCategoryInformation.RISK_MINIMIZATION) {
    return (
      <Card className={styles.card} title="События и мероприятия, связанные с минимизацией рисков и угроз">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание проводимых работ" name="audit_description">
              <TextArea rows={4} placeholder="Описание работ по аудиту и контролю защищённости" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Проведено/просканировано" name="scanned_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Выявлено уязвимостей" name="vulnerabilities_found">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Защита КТ и КИ
  if (category === EOperationalActivityCategoryInformation.CT_KI_PROTECTION) {
    return (
      <Card className={styles.card} title="Реализация режима защиты КТ и КИ">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание проведенных работ" name="ct_ki_description">
              <TextArea rows={4} placeholder="Описание работ по защите КТ и КИ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Зарегистрировано документов" name="confidential_docs">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Проведено проверок" name="compliance_checks">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Повышение осведомленности
  if (category === EOperationalActivityCategoryInformation.AWARENESS_RAISING) {
    return (
      <Card className={styles.card} title="Повышение осведомленности в области ИБ">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание проведенных работ" name="awareness_description">
              <TextArea rows={4} placeholder="Описание информирований сотрудников об ИБ" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Контроль доступа к ИС
  if (category === EOperationalActivityCategoryInformation.ACCESS_CONTROL) {
    return (
      <Card className={styles.card} title="Контроль доступа к ИС и действий привилегированных пользователей">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание проведенных работ" name="access_control_description">
              <TextArea rows={4} placeholder="Описание контроля удаленного доступа к ИС" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Рассмотрено заявок" name="access_requests">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Нарушений доступа" name="access_violations">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Аудитов учетных записей" name="account_audits">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Выявлено нарушений" name="violations_found">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Мониторинг инцидентов (сокращенная версия)
  if (category === EOperationalActivityCategoryInformation.INCIDENT_MONITORING) {
    return (
      <Card className={styles.card} title="Мониторинг инцидентов ИБ">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Обработано инцидентов ИБ" name="processed_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Нарушения админ. прав" name="admin_rights_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Подозрения в доступе КСПД" name="kspd_access_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Спам-активность" name="spam_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Вирусная активность" name="virus_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Некорпоративное ПО" name="software_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Нарушения КИ и ПДн" name="ki_pdn_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Сетевые атаки" name="network_attacks_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Утечки КИ/КТ" name="leaks_found">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Заблокировано угроз" name="blocked_threats">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Другие инциденты" name="other_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Описание других инцидентов" name="other_incidents_description">
              <TextArea rows={3} placeholder="Описание других инцидентов ИБ" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Противодействие фроду
  if (category === EOperationalActivityCategoryInformation.FRAUD_PREVENTION) {
    return (
      <Card className={styles.card} title="Мероприятия по противодействию фроду">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Выявлено инцидентов фрода" name="fraud_incidents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Описание работ по противодействию фроду" name="fraud_description">
              <TextArea rows={4} placeholder="Описание мероприятий" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Анализ изменений в инфраструктуре
  if (category === EOperationalActivityCategoryInformation.INFRASTRUCTURE_ANALYSIS) {
    return (
      <Card className={styles.card} title="Анализ изменений в информационной инфраструктуре">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Обработано документов" name="analyzed_documents">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Анализ рисков
  if (category === EOperationalActivityCategoryInformation.RISK_ANALYSIS) {
    return (
      <Card className={styles.card} title="Анализ текущих рисков и угроз в сфере ИБ">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание работ по оценке рисков" name="risk_analysis_description">
              <TextArea rows={4} placeholder="Описание оценки, регистрации и нивелирования рисков" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Проектная деятельность
  if (category === EOperationalActivityCategoryInformation.PROJECT_ACTIVITIES) {
    return (
      <Card className={styles.card} title="Мероприятия по реализации проектной и нормотворческой деятельности">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Статус и описание проектных работ" name="project_status_description">
              <TextArea rows={4} placeholder="Статус обновления/внедрения систем ИБ" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Перечень нормативных документов" name="normative_docs_list">
              <TextArea rows={3} placeholder="Перечень пересмотренных/утвержденных документов" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Эксплуатация систем
  if (category === EOperationalActivityCategoryInformation.SYSTEM_OPERATION) {
    return (
      <Card className={styles.card} title="Мероприятия по эксплуатации средств и систем ИБ">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Договоры на техподдержку" name="support_contracts">
              <TextArea rows={3} placeholder="Перечень и статус договоров" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Операционная деятельность" name="administration_activities">
              <TextArea rows={3} placeholder="Администрирование систем ИБ" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Другая деятельность" name="other_administration">
              <TextArea rows={3} placeholder="Администрирование ключей ЭЦП и т.п." />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Информация об авариях" name="system_failures">
              <TextArea rows={3} placeholder="Аварии, ремонтные работы" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // ИБ - Прочая деятельность
  if (category === EOperationalActivityCategoryInformation.OTHER_ACTIVITIES) {
    return (
      <Card className={styles.card} title="Прочая деятельность">
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <Form.Item label="Описание прочей деятельности" name="other_activities_description">
              <TextArea rows={4} placeholder="Важные события, проверки регуляторов, аналитические записки и т.п." />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Штатное количество сотрудников
  if (category === EOperationalActivityCategorySecurity.STAFF_COUNT) {
    return (
      <Card className={styles.card} title="Штатное количество сотрудников безопасности">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Количество сотрудников (включая филиалы и ДЗО)" name="staff_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Количество объектов
  if (category === EOperationalActivityCategorySecurity.OBJECTS_COUNT) {
    return (
      <Card className={styles.card} title="Количество объектов">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Под физической охраной" name="objects_physical_security">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Под пультовой охраной" name="objects_panel_security">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Бюджет CAPEX
  if (category === EOperationalActivityCategorySecurity.CAPEX_BUDGET) {
    return (
      <Card className={styles.card} title="Бюджет на усиление АТЗ объектов (CAPEX)">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Выделенный бюджет на год (руб.)" name="capex_allocated">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Освоение в текущем месяце (руб.)" name="capex_spent_current">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Бюджет OPEX
  if (category === EOperationalActivityCategorySecurity.OPEX_BUDGET) {
    return (
      <Card className={styles.card} title="Бюджет на физ. охрану (OPEX)">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Выделенный бюджет на год (руб.)" name="opex_allocated">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Проверки АТЗ
  if (category === EOperationalActivityCategorySecurity.ATZ_INSPECTIONS) {
    return (
      <Card className={styles.card} title="Проведено проверок состояния АТЗ объектов">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Сотрудниками ПБ ДЗК/ДЗО" name="atz_checks_pb">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Совместно с ПОО" name="atz_checks_law">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - АТУ и АТТ
  if (category === EOperationalActivityCategorySecurity.ATU_ATT) {
    return (
      <Card className={styles.card} title="Проведено АТУ и АТТ на объектах">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Сотрудниками ПБ" name="atu_att_pb">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Совместно с ПОО" name="atu_att_law">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Взаимодействие с ЧОП
  if (category === EOperationalActivityCategorySecurity.SECURITY_COMPANY) {
    return (
      <Card className={styles.card} title="Взаимодействие с ЧОП/ЧОО">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Проведено проверок несения службы" name="chop_checks">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Подготовлено претензий" name="chop_claims">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Проникновение на объект
  if (category === EOperationalActivityCategorySecurity.INTRUSION) {
    return (
      <Card className={styles.card} title="Проникновение на объект">
        <Divider orientation="left" plain>Случаи проникновения</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Всего случаев (попыток)" name="intrusion_total">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Не предотвращенные" name="intrusion_not_prevented">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Предотвращенные" name="intrusion_prevented">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Задержано лиц" name="intrusion_detained">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Ущерб</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Установленный ущерб (руб.)" name="intrusion_damage">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Предотвращенный ущерб (руб.)" name="intrusion_prevented_damage">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Возмещенный ущерб (руб.)" name="intrusion_recovered">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Меры</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Сотрудников причастных" name="intrusion_employees">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Дисциплинарных взысканий" name="intrusion_penalties">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Уволено" name="intrusion_dismissals">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Материалов в ПОО" name="intrusion_materials">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Возбуждено дел" name="intrusion_cases_opened">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Окончено дел" name="intrusion_cases_closed">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Нападение на объект/сотрудников
  if (category === EOperationalActivityCategorySecurity.ATTACK) {
    return (
      <Card className={styles.card} title="Нападение на объект/сотрудников (грабеж, разбой)">
        <Divider orientation="left" plain>Случаи нападения</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Всего случаев (попыток)" name="attack_total">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Не предотвращенные" name="attack_not_prevented">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Предотвращенные" name="attack_prevented">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Задержано лиц" name="attack_detained">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Ущерб</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Установленный ущерб (руб.)" name="attack_damage">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Предотвращенный ущерб (руб.)" name="attack_prevented_damage">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item label="Возмещенный ущерб (руб.)" name="attack_recovered">
              <InputNumber style={{ width: "100%" }} placeholder="0.00" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Меры</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Сотрудников причастных" name="attack_employees">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Дисциплинарных взысканий" name="attack_penalties">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Уволено" name="attack_dismissals">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Материалов в ПОО" name="attack_materials">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Возбуждено дел" name="attack_cases_opened">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label="Окончено дел" name="attack_cases_closed">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // БПиО - Проведено проверок и СР
  if (category === EOperationalActivityCategorySecurity.INVESTIGATIONS) {
    return (
      <Card className={styles.card} title="Проведено проверок и СР">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Количество проверок и СР" name="investigations_count">
              <InputNumber style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    );
  }

  // КБ - Взаимодействие с правоохранительными органами
  if (category === EOperationalActivityCategoryCyber.CYBER_LAW_ENFORCEMENT) {
    return (
      <Card className={styles.card} title="Взаимодействие с правоохранительными органами">
        <div className={styles.formFields}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Поступило входящих бумажных запросов ПОО на предоставление информации" name="cyber_incoming_paper_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Исполнено бумажных запросов ПОО на предоставление информации" name="cyber_executed_paper_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Исполнено заданий в бумажных запросах ПОО на предоставление информации" name="cyber_executed_paper_tasks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="Поступило представлений правоохранительных органов, прокуратуры и суда" name="cyber_received_presentations">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item label="из них исполнено (подготовлен ответ)" name="cyber_executed_presentations">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
    );
  }

  // Если категория не распознана
  return (
    <Card className={styles.card}>
      <p className={styles.hint}>Выбранная категория не имеет дополнительных полей</p>
    </Card>
  );
};

