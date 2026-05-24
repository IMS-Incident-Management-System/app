import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Card,
  Typography,
  Spin,
  Divider,
  Tag,
  Descriptions,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetOperationalActivity } from "../../services/requests/operationalActivities/getOperationalActivity";
import { ERoutes } from "../../enums/routes";
import {
  OperationalActivityDirectionLabels,
} from "../../enums/operationalActivity";
import dayjs from "dayjs";
import styles from "./OperationalActivityView.module.scss";
import { PrimaryButton } from "../../components/PrimaryButton";
import { selectCanUpdateOperationalActivity } from "../../store/features/permissions/selectors";

const { Title } = Typography;

export const OperationalActivityView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: operationalActivity, isLoading } = useGetOperationalActivity(id);
  const canUpdateOA = useSelector(selectCanUpdateOperationalActivity);

  const handleBack = () => {
    navigate(ERoutes.OPERATIONAL_ACTIVITIES_LIST);
  };

  const handleEdit = () => {
    navigate(`${ERoutes.OPERATIONAL_ACTIVITY_CREATE}/${id}`);
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

  if (!operationalActivity) {
    return (
      <div className={styles.container}>
        <Card>
          <p>Операционная деятельность не найдена</p>
          <PrimaryButton variant="secondary" onClick={handleBack}>Назад к списку</PrimaryButton>
        </Card>
      </div>
    );
  }

  const getDirectionColor = (direction: string) => {
    if (direction === 'INFORMATION') return 'blue';
    if (direction === 'ECONOMIC') return 'green';
    if (direction === 'SECURITY') return 'orange';
    if (direction === 'CYBER') return 'purple';
    if (direction === 'ANTIFRAUD') return 'red';
    if (direction === 'SORM') return 'cyan';
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

  // Функция для получения всех непустых полей операционной деятельности, сгруппированных по секциям
  const getOperationalActivityFields = () => {
    type FieldGroup = {
      sectionTitle: string;
      subsections?: Array<{ subsectionTitle?: string; fields: Array<{ key: string; label: string; type?: 'money' | 'number' | 'text' }> }>;
    };

    const sections: FieldGroup[] = [];
    
    // Полный маппинг всех полей для всех направлений, сгруппированных по секциям
    const fieldMappings: Record<string, FieldGroup[]> = {
      // ЭБ - все поля, сгруппированные по секциям
      'ECONOMIC': [
        {
          sectionTitle: 'Работа по возмещению ДЗ и НДС',
          subsections: [{
            fields: [
              { key: 'total_debt', label: 'Общий размер дебиторской задолженности (руб.)', type: 'money' },
              { key: 'overdue_debt', label: 'Общий размер просроченной дебиторской задолженности (руб.)', type: 'money' },
              { key: 'overdue_debt_sb', label: 'В том числе размер ПДЗ, переданный в работу СБ (руб.)', type: 'money' },
              { key: 'recovered_debt', label: 'Взыскано ДЗ при участии подразделений безопасности (руб.)', type: 'money' },
              { key: 'available_vat', label: 'Общая сумма доступного к возмещению, но не возмещенного НДС (руб.)', type: 'money' },
              { key: 'vat_assistance', label: 'Содействие в получении документов для возмещения НДС (руб.)', type: 'money' },
              { key: 'written_off_debt', label: 'Общий размер списанной дебиторской задолженности (руб.)', type: 'money' },
            ]
          }]
        },
        {
          sectionTitle: 'Контроль инвестиционной, закупочной и договорной деятельности',
          subsections: [{
            fields: [
              { key: 'checked_entities_new', label: 'Проверено юр. и физ.лиц перед заключением новых договоров, доп.соглашений и ОВП', type: 'number' },
              { key: 'negative_conclusions_new', label: 'Из них дано отрицательных заключений по потенциальным контрагентам', type: 'number' },
              { key: 'checked_entities_active', label: 'Проверено контрагентов с действующими договорами', type: 'number' },
              { key: 'negative_conclusions_active', label: 'Из них дано отрицательных заключений по контрагентам', type: 'number' },
              { key: 'checked_draft_contracts', label: 'Проверено проектов договоров. доп. соглашений, заказов и ОВП', type: 'number' },
              { key: 'not_approved_drafts', label: 'Из них не согласовано', type: 'number' },
              { key: 'checked_active_contracts', label: 'Проверено действующих договоров, доп. соглашений и заказов', type: 'number' },
              { key: 'not_approved_active', label: 'Из них не согласовано', type: 'number' },
              { key: 'planned_budget', label: 'Сумма запланированного бюджета закупок на год (руб.)', type: 'money' },
              { key: 'procurement_procedures_count', label: 'Проведено закупочных процедур (кол-во)', type: 'number' },
              { key: 'single_source_count', label: 'Из них использован способ закупки "единственный источник" (кол-во)', type: 'number' },
              { key: 'procurement_procedures_sum', label: 'Проведено закупочных процедур на сумму (руб.)', type: 'money' },
              { key: 'single_source_sum', label: 'Из них использован способ закупки "единственный источник" на сумму (руб.)', type: 'money' },
            ]
          }]
        },
        {
          sectionTitle: 'Работа по выявлению признаков аффилированности',
          subsections: [{
            fields: [
              { key: 'checked_employees', label: 'Проверено сотрудников на их возможную аффилированность с контрагентами (чел.)', type: 'number' },
                { key: 'found_affiliated', label: 'Из них выявлено аффилированных лиц', type: 'number' },
              { key: 'checked_candidates', label: 'Проверено кандидатов на трудоустройство (чел.)', type: 'number' },
                { key: 'rejected_candidates', label: 'Из них отклонено', type: 'number' },
                { key: 'rejected_affiliated', label: 'Из них отклонено по причине аффилированности', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Работа с обращениями граждан',
          subsections: [{
            fields: [
              { key: 'total_appeals', label: 'Проверено обращений граждан и юр. лиц', type: 'number' },
              { key: 'zon_applications', label: 'Проверено заявлений абонентов о непричастности к договору (ЗОН)', type: 'number' },
                { key: 'fictitious_contracts', label: 'Из них выявлено фиктивных договоров', type: 'number' },
              { key: 'termination_requests', label: 'Проверено заявлений абонентов о расторжении договора и возврате ДС', type: 'number' },
              { key: 'beautiful_numbers', label: 'Проверено запросов на переоформление "красивых" номеров', type: 'number' },
              { key: 'sim_replacement', label: 'Проверено заявлений о неправомерной замене SIM-карт с последующим выводом ДС', type: 'number' },
              { key: 'refund_requests', label: 'Проверено заявлений абонентов о возврате ошибочного платежа', type: 'number' },
              { key: 'other_appeals', label: 'Проверено прочих заявлений абонентов', type: 'number' },
            ]
          }]
        },
      ],
      // ИБ - все поля, сгруппированные по секциям
      'INFORMATION': [
        {
          sectionTitle: 'Сведения об участии в проверочных мероприятиях',
          subsections: [{
            fields: [
              { key: 'ib_incident_checks', label: 'Проведено проверок и служебных расследований по инцидентам ИБ (кол-во)', type: 'number' },
              { key: 'planned_ib_checks', label: 'Проведено плановых проверок ИБ (кол-во)', type: 'number' },
              { key: 'non_compliances', label: 'Выявлено несоответствий нормативным документам (кол-во)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Меры, принятые к нарушителям',
          subsections: [{
            fields: [
              { key: 'warnings', label: 'Предупреждение (кол-во)', type: 'number' },
              { key: 'remarks', label: 'Замечание (кол-во)', type: 'number' },
              { key: 'reprimands', label: 'Выговор (кол-во)', type: 'number' },
              { key: 'dismissals', label: 'Увольнение по соответствующим основаниям (кол-во)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Количество согласованных доступов к информационным активам',
          subsections: [{
            fields: [
              { key: 'approved_accesses', label: 'Количество согласованных доступов к информационным активам', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Подготовлено служебных записок руководству',
          subsections: [{
            fields: [
              { key: 'memos_count', label: 'Подготовлено служебных записок руководству', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'События и мероприятия, связанные с минимизацией рисков и угроз в информационной сфере',
          subsections: [{
            fields: [
              { key: 'audit_security_control_count', label: 'Проведение аудита и контроль защищённости информационной инфраструктуры ИС', type: 'number' },
              { key: 'work_status_result_count', label: 'Описание статуса и/или результата проводимых работ в рамках данной задачи', type: 'number' },
              { key: 'scanned_count', label: 'Проведено /просканировано (кол-во)', type: 'number' },
              { key: 'vulnerabilities_found', label: 'Выявлено уязвимостей (кол-во)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Реализация режима защиты КТ и КИ',
          subsections: [{
            fields: [
              { key: 'ct_ki_description', label: 'Описание проведенных работ в рамках реализации режима защиты коммерческой тайны, а так же проведения мероприятий по предотвращению утечки конфиденциальной информации и персональных данных (текст)', type: 'text' },
              { key: 'confidential_docs', label: 'Зарегистрировано конфиденциальных документов (кол-во)', type: 'number' },
              { key: 'compliance_checks', label: 'Проведено проверок на соответствие нормативным документам (кол-во)', type: 'number' },
              { key: 'ct_ki_protection_count', label: 'Реализация режима защиты КТ и КИ', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Повышение осведомленности в области ИБ сотрудников компании',
          subsections: [{
            fields: [
              { key: 'awareness_description', label: 'Описание проведенных работ по проведению информирований сотрудников компании (в том числе обмен опытом между подразделений ИБ) о правилах и рекомендациях по ИБ, а так же сведениях об актуальных угрозах ИБ (текст)', type: 'text' },
              { key: 'awareness_count', label: 'Повышение осведомленности в области ИБ сотрудников компании', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Контроль доступа к ИС и действий привилегированных пользователей',
          subsections: [{
            fields: [
              { key: 'access_control_description', label: 'Описание проведенных работ по контролю и выявлению нарушений, связанных с удаленным доступом к ИС (текст)', type: 'text' },
              { key: 'access_requests', label: 'Рассмотрено заявок на предоставление доступа к ИС (кол-во)', type: 'number' },
              { key: 'access_violations', label: 'Зафиксировано нарушений предоставления доступа к ИС (кол-во)', type: 'number' },
              { key: 'account_audits', label: 'Проведено аудитов учетных записей (кол-во)', type: 'number' },
              { key: 'violations_found', label: 'Выявлено нарушений (кол-во)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Мониторинг инцидентов ИБ',
          subsections: [{
            fields: [
              { key: 'processed_incidents', label: 'Обработано инцидентов ИБ (кол-во), из них:', type: 'number' },
              { key: 'admin_rights_incidents', label: 'Инцидентов, связанных с нарушением процедур предоставления административных прав (кол-во)', type: 'number' },
              { key: 'kspd_access_incidents', label: 'Инцидентов по подозрению в нелегитимном доступе в КСПД (кол-во)', type: 'number' },
              { key: 'spam_incidents', label: 'Инцидентов по подозрению внутренней спам-активности (кол-во)', type: 'number' },
              { key: 'virus_incidents', label: 'Инцидентов, связанных с вирусной активностью, целенаправленными вирусными атаками, вирусными эпидемиями в КСПД (кол-во)', type: 'number' },
              { key: 'software_incidents', label: 'Инцидентов, связанных с выявлением некорпоративного, нелицензионного, вредоносного ПО и самостоятельным изменением в настройках ПК (кол-во)', type: 'number' },
              { key: 'ki_pdn_incidents', label: 'Инцидентов, связанных с нарушениями порядка обработки КИ и ПДн (кол-во)', type: 'number' },
              { key: 'network_attacks_incidents', label: 'Инцидентов по подозрению в сетевых атаках, ботнет-сетей и подозрительной сетевой активности (кол-во)', type: 'number' },
              { key: 'leaks_found', label: 'Выявлено утечек КИ или информации, составляющей КТ (кол-во)', type: 'number' },
              { key: 'blocked_threats', label: 'В рамках мониторинга инцидентов ИБ заблокировано (вирусной активности, спам, вредоносных и других нежелательных сообщений, сетевых атак, запрещенных и вредоносных ресурсов сети Интернет) (кол-во)', type: 'number' },
              { key: 'other_incidents', label: 'Другие инциденты ИБ (кол-во)', type: 'number' },
              { key: 'other_incidents_description', label: 'Описание других инцидентов ИБ (текст)', type: 'text' },
            ]
          }]
        },
        {
          sectionTitle: 'Мероприятия по противодействию фроду',
          subsections: [{
            fields: [
              { key: 'fraud_incidents', label: 'Выявлено инцидентов фрода, находящихся в зоне ответственности ИБ (кол-во)', type: 'number' },
              { key: 'fraud_description', label: 'Описание проведенных работ по противодействию фроду, находящемуся в зоне ответственности подразделений ИБ (текст)', type: 'text' },
            ]
          }]
        },
        {
          sectionTitle: 'Анализ изменений в информационной инфраструктуре Компании с целью определения и применения требований ИБ',
          subsections: [{
            fields: [
              { key: 'analyzed_documents', label: 'Обработано документов в рамках участия в составах проектных рабочих групп компании (анализ на соответствие требованиям ИБ внедряемых услуг или информационных систем) (кол-во)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Анализ текущих рисков и угроз в сфере ИБ в рамках Компании',
          subsections: [{
            fields: [
              { key: 'risk_analysis_description', label: 'Описание проведенных работ по оценке, регистрации и нивелированию рисков ИБ Компании (текст)', type: 'text' },
            ]
          }]
        },
        {
          sectionTitle: 'Мероприятия по реализации проектной и нормотворческой деятельности в области информационной безопасности',
          subsections: [{
            fields: [
              { key: 'project_status_description', label: 'Реализация проектной деятельности в области ИБ - Статус и описание проведенных работ по обновлению и/или внедрению систем ИБ (верхнеуровневые реперные точки, например, подготовка ТЗ, RFI, RFP, заключение договора, завершение этапа работ, ввод в эксплуатацию и т.п.) (текст)', type: 'text' },
              { key: 'normative_docs_update_description', label: 'Актуализация нормативной и справочной документации по линии ИБ (текст)', type: 'text' },
              { key: 'normative_docs_list', label: 'Перечень и статус пересмотренных и/или утвержденных нормативных документов по ИБ (текст)', type: 'text' },
            ]
          }]
        },
        {
          sectionTitle: 'Мероприятия по эксплуатации средств и систем ИБ',
          subsections: [{
            fields: [
              { key: 'support_contracts', label: 'Заключение договоров на техническую поддержку и/или обновление лицензий на ИС ДИБ, внедренных в компании, в т.ч. перечень и статус договоров на техническую поддержку систем ИБ (текст)', type: 'text' },
              { key: 'administration_activities', label: 'Операционная деятельность по администрированию систем ИБ.', type: 'text' },
              { key: 'other_administration', label: 'Другая деятельность, проводимая в рамках администрирования и сопровождения систем ИБ, например, администрирование ключей ЭЦП для удалённого доступа к корпоративной сети компании и работы в ПО КриптоАрм (кол-во выданных, утерянных и т.п.).', type: 'text' },
              { key: 'system_failures', label: 'Информация об авариях на системах ИБ, проведении ремонтных работ в рамках технической поддержки.', type: 'text' },
            ]
          }]
        },
        {
          sectionTitle: 'Прочая деятельность',
          subsections: [{
            fields: [
              { key: 'other_activities_description', label: 'Прочая деятельность (важные события, проверки регуляторов, ответы в прокуратуру, подготовлено аналитических записок и т.п.).', type: 'text' },
            ]
          }]
        },
      ],
      // БПиО - все поля, сгруппированные по секциям
      'SECURITY': [
        {
          sectionTitle: 'Штатное количество сотрудников безопасности (включая филиалы и ДЗО)',
          subsections: [{
            fields: [
              { key: 'staff_count', label: 'Штатное количество сотрудников безопасности (включая филиалы и ДЗО)', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Количество объектов',
          subsections: [{
            fields: [
              { key: 'objects_count', label: 'Количество объектов', type: 'number' },
              { key: 'objects_physical_security', label: 'Под физической охраной', type: 'number' },
              { key: 'objects_panel_security', label: 'Под пультовой охраной', type: 'number' },
              { key: 'categorized_rooms_count', label: 'Количество категорированных помещений', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Бюджет на усиление АТЗ объектов (CAPEX)',
          subsections: [{
            fields: [
              { key: 'capex_allocated', label: 'Сумма выделенного бюджета на год (руб.)', type: 'money' },
              { key: 'capex_spent_current', label: 'Сумма освоения бюджета в текущем месяце (руб.)', type: 'money' },
            ]
          }]
        },
        {
          sectionTitle: 'Бюджет на физ. охрану (OPEX)',
          subsections: [{
            fields: [
              { key: 'opex_allocated', label: 'Сумма выделенного бюджета на год (руб.)', type: 'money' },
            ]
          }]
        },
        {
          sectionTitle: 'Проведено проверок состояния АТЗ объектов',
          subsections: [{
            fields: [
              { key: 'atz_checks_pb', label: 'Сотрудниками ПБ ДЗК/ДЗО', type: 'number' },
              { key: 'atz_checks_law', label: 'Совместно с сотрудниками правоохранительных органов', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Проведено АТУ и АТТ на объектах',
          subsections: [{
            fields: [
              { key: 'atu_att_pb', label: 'Сотрудниками ПБ ДЗК/ДЗО', type: 'number' },
              { key: 'atu_att_law', label: 'Совместно с сотрудниками правоохранительных органов', type: 'number' },
            ]
          }]
        },
        {
          sectionTitle: 'Взаимодействие с ЧОП/ЧОО',
          subsections: [{
            fields: [
              { key: 'chop_checks', label: 'Проведено проверок несения службы сотрудниками ЧОП/ЧОО', type: 'number' },
              { key: 'chop_claims', label: 'Подготовлено претензий к ЧОП/ЧОО', type: 'number' },
            ]
          }]
        },
      ],
      // КБ - все поля, сгруппированные по секциям
      'CYBER': [
        {
          sectionTitle: 'Взаимодействие с правоохранительными органами',
          subsections: [{
            fields: [
              { key: 'cyber_incoming_paper_requests', label: 'Поступило входящих бумажных запросов ПОО на предоставление информации', type: 'number' },
              { key: 'cyber_executed_paper_requests', label: 'Исполнено бумажных запросов ПОО на предоставление информации', type: 'number' },
              { key: 'cyber_executed_paper_tasks', label: 'Исполнено заданий в бумажных запросах ПОО на предоставление информации', type: 'number' },
              { key: 'cyber_received_presentations', label: 'Поступило представлений правоохранительных органов, прокуратуры и суда', type: 'number' },
              { key: 'cyber_executed_presentations', label: 'Из них исполнено (подготовлен ответ)', type: 'number' },
            ]
          }]
        },
      ],
    };

    // Определяем ключ для маппинга по направлению
    const mappingKey = operationalActivity.direction;

    const directionSections = fieldMappings[mappingKey] || [];
    
    // Обрабатываем каждую секцию
    directionSections.forEach((section) => {
      // Добавляем секцию только если в ней есть заполненные поля
      const processedSubsections = section.subsections?.map(subsection => ({
        subsectionTitle: subsection.subsectionTitle,
        fields: subsection.fields
          .filter(({ key }) => {
            const value = (operationalActivity as any)[key];
            return value !== null && value !== undefined && value !== '' && value !== 0;
          })
          .map(({ key, label, type }) => ({
            key,
            label,
            type,
            value: (() => {
              const value = (operationalActivity as any)[key];
              return type === 'money' 
                ? renderMoneyField(value)
                : type === 'number'
                ? renderNumberField(value)
                : value;
            })()
          }))
      })).filter(subsection => subsection.fields.length > 0);
      
      if (processedSubsections && processedSubsections.length > 0) {
        sections.push({
          sectionTitle: section.sectionTitle,
          subsections: processedSubsections
        });
      }
    });

    return sections;
  };

  const operationalActivitySections = getOperationalActivityFields();

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
              Операционная деятельность {operationalActivity.code || `#${operationalActivity.id}`}
            </Title>
            {canUpdateOA && (
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
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID операционной деятельности">
                {operationalActivity.code || `#${operationalActivity.id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Подразделение">
                {operationalActivity.department?.title || "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Период">
                {operationalActivity.period_from && operationalActivity.period_to
                  ? `${dayjs(operationalActivity.period_from).format("DD.MM.YYYY")} - ${dayjs(operationalActivity.period_to).format("DD.MM.YYYY")}`
                  : "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Направление">
                <Tag color={getDirectionColor(operationalActivity.direction)}>
                  {OperationalActivityDirectionLabels[operationalActivity.direction] || operationalActivity.direction}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дата внесения">
                {operationalActivity.entry_date
                  ? dayjs(operationalActivity.entry_date).format("DD.MM.YYYY")
                  : "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {operationalActivity.createdAt
                  ? dayjs(operationalActivity.createdAt).format("DD.MM.YYYY HH:mm")
                  : "Не указано"}
              </Descriptions.Item>
              {operationalActivity.description && (
                <Descriptions.Item label="Описание" span={2}>
                  {operationalActivity.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Данные операционной деятельности по секциям */}
          {operationalActivitySections.length > 0 ? (
            operationalActivitySections.map((section, sectionIndex) => (
              <Card 
                key={sectionIndex} 
                title={section.sectionTitle} 
                className={styles.sectionCard}
              >
                {section.subsections?.map((subsection, subsectionIndex) => {
                  // Разделяем поля на текстовые и числовые
                  const textFields = subsection.fields.filter(field => field.type === 'text') as Array<{ key: string; label: string; type?: string; value: any }>;
                  const numberFields = subsection.fields.filter(field => field.type !== 'text') as Array<{ key: string; label: string; type?: string; value: any }>;
                  
                  return (
                    <div key={subsectionIndex}>
                      {subsection.subsectionTitle && (
                        <Divider orientation="left" plain>
                          {subsection.subsectionTitle}
                        </Divider>
                      )}
                      
                      {/* Текстовые поля */}
                      {textFields.map((field, fieldIndex) => (
                        <div key={`text-${fieldIndex}`} className={styles.textFieldContainer}>
                          <div className={styles.textFieldLabel}>{field.label}</div>
                          <div className={styles.textFieldValue}>{field.value}</div>
                        </div>
                      ))}
                      
                      {/* Числовые и денежные поля в одной таблице */}
                      {numberFields.length > 0 && (
                        <Descriptions column={1} bordered className={styles.numberFieldsTable}>
                          {numberFields.map((field, fieldIndex) => (
                            <Descriptions.Item key={fieldIndex} label={field.label}>
                              {field.value}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      )}
                      
                      {subsectionIndex < (section.subsections?.length || 0) - 1 && (
                        <Divider style={{ margin: '16px 0' }} />
                      )}
                    </div>
                  );
                })}
              </Card>
            ))
          ) : (
            <Card className={styles.sectionCard}>
              <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                Дополнительные данные не заполнены
              </p>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};


