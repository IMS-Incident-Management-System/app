import { Form, Card, InputNumber, Input, Divider } from "antd";
import { EOperationalActivityDirection } from "../../../../enums/operationalActivity";
import styles from "./CategoryFields.module.scss";

const { TextArea } = Input;

export const CategoryFields = () => {
  const form = Form.useFormInstance();
  const direction = Form.useWatch("direction", form);

  if (!direction) {
    return (
      <Card className={styles.card}>
        <p className={styles.hint}>
          Выберите направление для отображения полей
        </p>
      </Card>
    );
  }

  // ЭБ - Экономическая безопасность
  if (direction === EOperationalActivityDirection.ECONOMIC) {
    return (
      <Card className={styles.card}>
        <div className={styles.formFields}>
          {/* Работа по возмещению ДЗ и НДС */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Работа по возмещению ДЗ и НДС</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Общий размер дебиторской задолженности (руб.)" name="total_debt">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Общий размер просроченной дебиторской задолженности (руб.)" name="overdue_debt">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="В том числе размер ПДЗ, переданный в работу СБ (руб.)" name="overdue_debt_sb">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Взыскано ДЗ при участии подразделений безопасности (руб.)" name="recovered_debt">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Общая сумма доступного к возмещению, но не возмещенного НДС (руб.)" name="available_vat">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Содействие в получении документов для возмещения НДС (руб.)" name="vat_assistance">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Общий размер списанной дебиторской задолженности (руб.)" name="written_off_debt">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Контроль инвестиционной, закупочной и договорной деятельности */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Контроль инвестиционной, закупочной и договорной деятельности</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проверено юр. и физ.лиц перед заключением новых договоров, доп.соглашений и ОВП" name="checked_entities_new">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них дано отрицательных заключений по потенциальным контрагентам" name="negative_conclusions_new">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено контрагентов с действующими договорами" name="checked_entities_active">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них дано отрицательных заключений по контрагентам" name="negative_conclusions_active">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено проектов договоров. доп. соглашений, заказов и ОВП" name="checked_draft_contracts">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них не согласовано" name="not_approved_drafts">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено действующих договоров, доп. соглашений и заказов" name="checked_active_contracts">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них не согласовано" name="not_approved_active">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Сумма запланированного бюджета закупок на год (руб.)" name="planned_budget">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Проведено закупочных процедур (кол-во)" name="procurement_procedures_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них использован способ закупки 'единственный источник' (кол-во)" name="single_source_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проведено закупочных процедур на сумму (руб.)" name="procurement_procedures_sum">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Из них использован способ закупки 'единственный источник' на сумму (руб.)" name="single_source_sum">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Работа по выявлению признаков аффилированности */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Работа по выявлению признаков аффилированности</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проверено сотрудников на их возможную аффилированность с контрагентами (чел.)" name="checked_employees">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них выявлено аффилированных лиц" name="found_affiliated">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено кандидатов на трудоустройство (чел.)" name="checked_candidates">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них отклонено" name="rejected_candidates">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них отклонено по причине аффилированности" name="rejected_affiliated">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Работа с обращениями граждан */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Работа с обращениями граждан</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проверено обращений граждан и юр. лиц" name="total_appeals">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено заявлений абонентов о непричастности к договору (ЗОН)" name="zon_applications">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них выявлено фиктивных договоров" name="fictitious_contracts">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено заявлений абонентов о расторжении договора и возврате ДС" name="termination_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено запросов на переоформление 'красивых' номеров" name="beautiful_numbers">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено заявлений о неправомерной замене SIM-карт с последующим выводом ДС" name="sim_replacement">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено заявлений абонентов о возврате ошибочного платежа" name="refund_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проверено прочих заявлений абонентов" name="other_appeals">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // КБ - Кибербезопасность
  if (direction === EOperationalActivityDirection.CYBER) {
    return (
      <Card className={styles.card}>
        <div className={styles.formFields}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Взаимодействие с правоохранительными органами</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Поступило входящих бумажных запросов ПОО на предоставление информации" name="cyber_incoming_paper_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Исполнено бумажных запросов ПОО на предоставление информации" name="cyber_executed_paper_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Исполнено заданий в бумажных запросах ПОО на предоставление информации" name="cyber_executed_paper_tasks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Поступило представлений правоохранительных органов, прокуратуры и суда" name="cyber_received_presentations">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Из них исполнено (подготовлен ответ)" name="cyber_executed_presentations">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ИБ - Информационная безопасность
  if (direction === EOperationalActivityDirection.INFORMATION) {
    return (
      <Card className={styles.card}>
        <div className={styles.formFields}>
          {/* Сведения об участии в проверочных мероприятиях */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Сведения об участии в проверочных мероприятиях</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проведено проверок и служебных расследований по инцидентам ИБ (кол-во)" name="ib_incident_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проведено плановых проверок ИБ (кол-во)" name="planned_ib_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Выявлено несоответствий нормативным документам (кол-во)" name="non_compliances">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Меры, принятые к нарушителям */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Меры, принятые к нарушителям</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Предупреждение (кол-во)" name="warnings">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Замечание (кол-во)" name="remarks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Выговор (кол-во)" name="reprimands">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Увольнение по соответствующим основаниям (кол-во)" name="dismissals">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Количество согласованных доступов */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Количество согласованных доступов к информационным активам</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Количество согласованных доступов к информационным активам" name="approved_accesses">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Подготовлено служебных записок */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Подготовлено служебных записок руководству</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Подготовлено служебных записок руководству" name="memos_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* События и мероприятия, связанные с минимизацией рисков и угроз */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>События и мероприятия, связанные с минимизацией рисков и угроз в информационной сфере</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проведение аудита и контроль защищённости информационной инфраструктуры ИС" name="audit_security_control_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Описание статуса и/или результата проводимых работ в рамках данной задачи" name="work_status_result_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проведено /просканировано (кол-во)" name="scanned_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Выявлено уязвимостей (кол-во)" name="vulnerabilities_found">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Реализация режима защиты КТ и КИ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Реализация режима защиты КТ и КИ</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Описание проведенных работ в рамках реализации режима защиты коммерческой тайны, а так же проведения мероприятий по предотвращению утечки конфиденциальной информации и персональных данных (текст)" name="ct_ki_description">
                <TextArea rows={4} placeholder="Описание работ по защите КТ и КИ" />
              </Form.Item>
              <Form.Item label="Зарегистрировано конфиденциальных документов (кол-во)" name="confidential_docs">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проведено проверок на соответствие нормативным документам (кол-во)" name="compliance_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Реализация режима защиты КТ и КИ" name="ct_ki_protection_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Повышение осведомленности */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Повышение осведомленности в области ИБ сотрудников компании</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Описание проведенных работ по проведению информирований сотрудников компании (в том числе обмен опытом между подразделений ИБ) о правилах и рекомендациях по ИБ, а так же сведениях об актуальных угрозах ИБ (текст)" name="awareness_description">
                <TextArea rows={4} placeholder="Описание информирований сотрудников об ИБ" />
              </Form.Item>
              <Form.Item label="Повышение осведомленности в области ИБ сотрудников компании" name="awareness_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Контроль доступа к ИС */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Контроль доступа к ИС и действий привилегированных пользователей</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Описание проведенных работ по контролю и выявлению нарушений, связанных с удаленным доступом к ИС (текст)" name="access_control_description">
                <TextArea rows={4} placeholder="Описание контроля удаленного доступа к ИС" />
              </Form.Item>
              <Form.Item label="Рассмотрено заявок на предоставление доступа к ИС (кол-во)" name="access_requests">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Зафиксировано нарушений предоставления доступа к ИС (кол-во)" name="access_violations">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Проведено аудитов учетных записей (кол-во)" name="account_audits">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Выявлено нарушений (кол-во)" name="violations_found">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Мониторинг инцидентов ИБ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Мониторинг инцидентов ИБ</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Обработано инцидентов ИБ (кол-во), из них:" name="processed_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов, связанных с нарушением процедур предоставления административных прав (кол-во)" name="admin_rights_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов по подозрению в нелегитимном доступе в КСПД (кол-во)" name="kspd_access_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов по подозрению внутренней спам-активности (кол-во)" name="spam_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов, связанных с вирусной активностью, целенаправленными вирусными атаками, вирусными эпидемиями в КСПД (кол-во)" name="virus_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов, связанных с выявлением некорпоративного, нелицензионного, вредоносного ПО и самостоятельным изменением в настройках ПК (кол-во)" name="software_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов, связанных с нарушениями порядка обработки КИ и ПДн (кол-во)" name="ki_pdn_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Инцидентов по подозрению в сетевых атаках, ботнет-сетей и подозрительной сетевой активности (кол-во)" name="network_attacks_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Выявлено утечек КИ или информации, составляющей КТ (кол-во)" name="leaks_found">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="В рамках мониторинга инцидентов ИБ заблокировано (вирусной активности, спам, вредоносных и других нежелательных сообщений, сетевых атак, запрещенных и вредоносных ресурсов сети Интернет) (кол-во)" name="blocked_threats">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Другие инциденты ИБ (кол-во)" name="other_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Описание других инцидентов ИБ (текст)" name="other_incidents_description">
                <TextArea rows={3} placeholder="Описание других инцидентов ИБ" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Противодействие фроду */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Мероприятия по противодействию фроду</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Выявлено инцидентов фрода, находящихся в зоне ответственности ИБ (кол-во)" name="fraud_incidents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Описание проведенных работ по противодействию фроду, находящемуся в зоне ответственности подразделений ИБ (текст)" name="fraud_description">
                <TextArea rows={4} placeholder="Описание мероприятий" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Анализ изменений в информационной инфраструктуре */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Анализ изменений в информационной инфраструктуре Компании с целью определения и применения требований ИБ</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Обработано документов в рамках участия в составах проектных рабочих групп компании (анализ на соответствие требованиям ИБ внедряемых услуг или информационных систем) (кол-во)" name="analyzed_documents">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Анализ текущих рисков и угроз */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Анализ текущих рисков и угроз в сфере ИБ в рамках Компании</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Описание проведенных работ по оценке, регистрации и нивелированию рисков ИБ Компании (текст)" name="risk_analysis_description">
                <TextArea rows={4} placeholder="Описание оценки, регистрации и нивелирования рисков" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Проектная и нормотворческая деятельность */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Мероприятия по реализации проектной и нормотворческой деятельности в области информационной безопасности</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Реализация проектной деятельности в области ИБ - Статус и описание проведенных работ по обновлению и/или внедрению систем ИБ (верхнеуровневые реперные точки, например, подготовка ТЗ, RFI, RFP, заключение договора, завершение этапа работ, ввод в эксплуатацию и т.п.) (текст)" name="project_status_description">
                <TextArea rows={4} placeholder="Статус обновления/внедрения систем ИБ" />
              </Form.Item>
              <Form.Item label="Актуализация нормативной и справочной документации по линии ИБ (текст)" name="normative_docs_update_description">
                <TextArea rows={3} placeholder="Описание актуализации нормативной документации" />
              </Form.Item>
              <Form.Item label="Перечень и статус пересмотренных и/или утвержденных нормативных документов по ИБ (текст)" name="normative_docs_list">
                <TextArea rows={3} placeholder="Перечень пересмотренных/утвержденных документов" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Эксплуатация средств и систем ИБ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Мероприятия по эксплуатации средств и систем ИБ</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Заключение договоров на техническую поддержку и/или обновление лицензий на ИС ДИБ, внедренных в компании, в т.ч. перечень и статус договоров на техническую поддержку систем ИБ (текст)" name="support_contracts">
                <TextArea rows={3} placeholder="Перечень и статус договоров" />
              </Form.Item>
              <Form.Item label="Операционная деятельность по администрированию систем ИБ." name="administration_activities">
                <TextArea rows={3} placeholder="Администрирование систем ИБ" />
              </Form.Item>
              <Form.Item label="Другая деятельность, проводимая в рамках администрирования и сопровождения систем ИБ, например, администрирование ключей ЭЦП для удалённого доступа к корпоративной сети компании и работы в ПО КриптоАрм (кол-во выданных, утерянных и т.п.)." name="other_administration">
                <TextArea rows={3} placeholder="Администрирование ключей ЭЦП и т.п." />
              </Form.Item>
              <Form.Item label="Информация об авариях на системах ИБ, проведении ремонтных работ в рамках технической поддержки." name="system_failures">
                <TextArea rows={3} placeholder="Аварии, ремонтные работы" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Прочая деятельность */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Прочая деятельность</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Прочая деятельность (важные события, проверки регуляторов, ответы в прокуратуру, подготовлено аналитических записок и т.п.)." name="other_activities_description">
                <TextArea rows={4} placeholder="Важные события, проверки регуляторов, аналитические записки и т.п." />
              </Form.Item>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // БПиО - Безопасность и охрана
  if (direction === EOperationalActivityDirection.SECURITY) {
    return (
      <Card className={styles.card}>
        <div className={styles.formFields}>
          {/* Штатное количество сотрудников */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Штатное количество сотрудников безопасности (включая филиалы и ДЗО)</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Штатное количество сотрудников безопасности (включая филиалы и ДЗО)" name="staff_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Количество объектов */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Количество объектов</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Количество объектов" name="objects_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Под физической охраной" name="objects_physical_security">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Под пультовой охраной" name="objects_panel_security">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Количество категорированных помещений" name="categorized_rooms_count">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Бюджет CAPEX */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Бюджет на усиление АТЗ объектов (CAPEX)</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Сумма выделенного бюджета на год (руб.)" name="capex_allocated">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
              <Form.Item label="Сумма освоения бюджета в текущем месяце (руб.)" name="capex_spent_current">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Бюджет OPEX */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Бюджет на физ. охрану (OPEX)</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Сумма выделенного бюджета на год (руб.)" name="opex_allocated">
                <InputNumber style={{ width: "100%" }} placeholder="0.00" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Проверки АТЗ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Проведено проверок состояния АТЗ объектов</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Сотрудниками ПБ ДЗК/ДЗО" name="atz_checks_pb">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Совместно с сотрудниками правоохранительных органов" name="atz_checks_law">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* АТУ и АТТ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Проведено АТУ и АТТ на объектах</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Сотрудниками ПБ ДЗК/ДЗО" name="atu_att_pb">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Совместно с сотрудниками правоохранительных органов" name="atu_att_law">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

          <Divider className={styles.divider} />

          {/* Взаимодействие с ЧОП */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Взаимодействие с ЧОП/ЧОО</div>
            <div className={styles.fieldsList}>
              <Form.Item label="Проведено проверок несения службы сотрудниками ЧОП/ЧОО" name="chop_checks">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item label="Подготовлено претензий к ЧОП/ЧОО" name="chop_claims">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </div>
          </div>

        </div>
      </Card>
    );
  }

  // Если направление не распознано
  return (
    <Card className={styles.card}>
      <p className={styles.hint}>Для выбранного направления пока нет полей</p>
    </Card>
  );
};
