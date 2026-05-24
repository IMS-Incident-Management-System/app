import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';
import {
  OperationalActivityDirectionEnum,
} from '../enums/operationalActivity';

export interface OperationalActivityAttributes {
  id: number;
  code?: string; // Уникальный код операционной деятельности (формат: OA-DDMMYYYY-HHmmss)
  department_id: number;
  created_by?: string; // ID пользователя из Keycloak
  period_from: Date; // Период с
  period_to: Date; // Период по
  direction: OperationalActivityDirectionEnum; // Тип (ЭБ, ИБ, БПиО)
  description?: string; // Описание операционной деятельности
  entry_date?: Date; // Дата внесения операционной деятельности

  // ====== ЭБ - DEBT_RECOVERY (Работа по возмещению ДЗ и НДС) ======
  total_debt?: number;
  overdue_debt?: number;
  overdue_debt_sb?: number;
  recovered_debt?: number;
  available_vat?: number;
  vat_assistance?: number;
  written_off_debt?: number;
  prevented_writeoff?: number;

  // ====== ЭБ - LAW_ENFORCEMENT (Взаимодействие с правоохранительными органами) ======
  incoming_requests?: number;
  executed_requests?: number;
  executed_tasks?: number;
  received_presentations?: number;
  executed_presentations?: number;

  // ====== ЭБ - INVESTMENT_CONTROL (Контроль инвестиционной, закупочной и договорной деятельности) ======
  checked_entities_new?: number; // Проверено юр. и физ.лиц перед заключением новых договоров
  negative_conclusions_new?: number;
  checked_entities_active?: number; // Проверено контрагентов с действующими договорами
  negative_conclusions_active?: number;
  checked_draft_contracts?: number; // Проверено проектов договоров
  not_approved_drafts?: number;
  checked_active_contracts?: number; // Проверено действующих договоров
  not_approved_active?: number;
  planned_budget?: number; // Сумма запланированного бюджета закупок
  procurement_procedures_count?: number; // Проведено закупочных процедур (кол-во)
  single_source_count?: number; // использован способ "единственный источник" (кол-во)
  procurement_procedures_sum?: number; // Проведено закупочных процедур на сумму
  single_source_sum?: number; // использован способ "единственный источник" на сумму
  cost_reduction?: number; // Снижена стоимость товаров, работ и услуг

  // ====== ЭБ - AFFILIATION (Работа по выявлению признаков аффилированности) ======
  checked_employees?: number; // Проверено сотрудников
  found_affiliated?: number;
  checked_candidates?: number; // Проверено кандидатов на трудоустройство
  rejected_candidates?: number;
  rejected_affiliated?: number;

  // ====== ЭБ - CITIZEN_APPEALS (Работа с обращениями граждан) ======
  total_appeals?: number; // Проверено обращений граждан и юр. лиц
  zon_applications?: number; // Заявлений абонентов о непричастности к договору
  fictitious_contracts?: number;
  termination_requests?: number; // Заявлений о расторжении договора и возврате ДС
  beautiful_numbers?: number; // Запросов на переоформление "красивых" номеров
  sim_replacement?: number; // Заявлений о неправомерной замене SIM-карт
  refund_requests?: number; // Заявлений о возврате ошибочного платежа
  other_appeals?: number; // Прочих заявлений абонентов

  // ====== ИБ - INSPECTIONS (Сведения об участии в проверочных мероприятиях) ======
  ib_incident_checks?: number; // проверок по инцидентам ИБ
  planned_ib_checks?: number; // плановых проверок ИБ
  non_compliances?: number; // несоответствий нормативным документам

  // ====== ИБ - VIOLATORS_MEASURES (Меры, принятые к нарушителям) ======
  warnings?: number;
  remarks?: number;
  reprimands?: number;
  dismissals?: number;

  // ====== ИБ - ACCESS_APPROVALS (Количество согласованных доступов) ======
  approved_accesses?: number;

  // ====== ИБ - MEMOS_PREPARED (Подготовлено служебных записок) ======
  memos_count?: number;

  // ====== ИБ - RISK_MINIMIZATION (События и мероприятия) ======
  audit_security_control_count?: number; // Проведение аудита и контроль защищённости информационной инфраструктуры ИС (кол-во)
  work_status_result_count?: number; // Описание статуса и/или результата проводимых работ в рамках данной задачи (кол-во)
  scanned_count?: number; // Проведено/просканировано
  vulnerabilities_found?: number; // Выявлено уязвимостей

  // ====== ИБ - CT_KI_PROTECTION (Реализация режима защиты КТ и КИ) ======
  ct_ki_description?: string; // Описание проведенных работ
  confidential_docs?: number; // Зарегистрировано конфиденциальных документов
  compliance_checks?: number; // Проведено проверок на соответствие нормативным документам
  ct_ki_protection_count?: number; // Реализация режима защиты КТ и КИ (кол-во)

  // ====== ИБ - AWARENESS_RAISING (Повышение осведомленности) ======
  awareness_description?: string;
  awareness_count?: number; // Повышение осведомленности в области ИБ сотрудников компании (кол-во)

  // ====== ИБ - ACCESS_CONTROL (Контроль доступа к ИС) ======
  access_control_description?: string;
  access_requests?: number; // Рассмотрено заявок на предоставление доступа
  access_violations?: number; // Зафиксировано нарушений
  account_audits?: number; // Проведено аудитов учетных записей
  violations_found?: number; // Выявлено нарушений

  // ====== ИБ - INCIDENT_MONITORING (Мониторинг инцидентов ИБ) ======
  processed_incidents?: number; // Обработано инцидентов ИБ
  admin_rights_incidents?: number;
  kspd_access_incidents?: number;
  spam_incidents?: number;
  virus_incidents?: number;
  software_incidents?: number;
  ki_pdn_incidents?: number;
  network_attacks_incidents?: number;
  leaks_found?: number;
  blocked_threats?: number;
  other_incidents?: number;
  other_incidents_description?: string;

  // ====== ИБ - FRAUD_PREVENTION (Противодействие фроду) ======
  fraud_incidents?: number;
  fraud_description?: string;

  // ====== ИБ - INFRASTRUCTURE_ANALYSIS (Анализ изменений) ======
  analyzed_documents?: number;

  // ====== ИБ - RISK_ANALYSIS (Анализ рисков и угроз) ======
  risk_analysis_description?: string;

  // ====== ИБ - PROJECT_ACTIVITIES (Проектная деятельность) ======
  project_status_description?: string; // Статус и описание проведенных работ
  normative_docs_update_description?: string; // Актуализация нормативной и справочной документации по линии ИБ (текст)
  normative_docs_list?: string; // Перечень и статус пересмотренных и/или утвержденных нормативных документов по ИБ (текст)

  // ====== ИБ - SYSTEM_OPERATION (Эксплуатация систем ИБ) ======
  support_contracts?: string; // Перечень договоров на техническую поддержку
  administration_activities?: string; // Операционная деятельность
  other_administration?: string; // Другая деятельность
  system_failures?: string; // Информация об авариях

  // ====== ИБ - OTHER_ACTIVITIES (Прочая деятельность) ======
  other_activities_description?: string;

  // ====== БПиО - STAFF_COUNT (Штатное количество сотрудников) ======
  staff_count?: number;

  // ====== БПиО - OBJECTS_COUNT (Количество объектов) ======
  objects_count?: number; // Количество объектов
  objects_physical_security?: number; // под физической охраной
  objects_panel_security?: number; // под пультовой охраной
  categorized_rooms_count?: number; // Количество категорированных помещений

  // ====== БПиО - CAPEX_BUDGET (Бюджет на усиление АТЗ) ======
  capex_allocated?: number; // Сумма выделенного бюджета на год
  capex_spent_current?: number; // Сумма освоения бюджета в текущем месяце

  // ====== БПиО - OPEX_BUDGET (Бюджет на физ. охрану) ======
  opex_allocated?: number;

  // ====== БПиО - ATZ_INSPECTIONS (Проверки состояния АТЗ) ======
  atz_checks_pb?: number; // сотрудниками ПБ ДЗК/ДЗО
  atz_checks_law?: number; // совместно с ПОО

  // ====== БПиО - ATU_ATT (АТУ и АТТ на объектах) ======
  atu_att_pb?: number; // сотрудниками ПБ
  atu_att_law?: number; // совместно с ПОО

  // ====== БПiО - SECURITY_COMPANY (Взаимодействие с ЧОП/ЧОО) ======
  chop_checks?: number; // Проведено проверок несения службы
  chop_claims?: number; // Подготовлено претензий

  // ====== БПиО - INTRUSION (Проникновение на объект) ======
  intrusion_total?: number; // Количество случаев (попыток)
  intrusion_not_prevented?: number;
  intrusion_prevented?: number;
  intrusion_detained?: number; // Задержаны лица
  intrusion_damage?: number; // Установлена сумма причиненного ущерба
  intrusion_prevented_damage?: number; // Предотвращен ущерб
  intrusion_recovered?: number; // Возмещен ущерб
  intrusion_employees?: number; // Установлено сотрудников, причастных
  intrusion_penalties?: number; // наложено дисциплинарных взысканий
  intrusion_dismissals?: number; // уволено с работы
  intrusion_materials?: number; // Передано материалов в ПОО
  intrusion_cases_opened?: number; // Возбуждено уголовных дел
  intrusion_cases_closed?: number; // Окончено уголовных дел

  // ====== БПиО - ATTACK (Нападение на объект/сотрудников) ======
  attack_total?: number;
  attack_not_prevented?: number;
  attack_prevented?: number;
  attack_detained?: number;
  attack_damage?: number;
  attack_prevented_damage?: number;
  attack_recovered?: number;
  attack_employees?: number;
  attack_penalties?: number;
  attack_dismissals?: number;
  attack_materials?: number;
  attack_cases_opened?: number;
  attack_cases_closed?: number;

  // ====== БПиО - INVESTIGATIONS (Проведено проверок и СР) ======
  investigations_count?: number;

  // ====== КБ - LAW_ENFORCEMENT (Взаимодействие с правоохранительными органами) ======
  cyber_incoming_paper_requests?: number; // Поступило входящих бумажных запросов ПОО на предоставление информации
  cyber_executed_paper_requests?: number; // Исполнено бумажных запросов ПОО на предоставление информации
  cyber_executed_paper_tasks?: number; // Исполнено заданий в бумажных запросах ПОО на предоставление информации
  cyber_received_presentations?: number; // Поступило представлений правоохранительных органов, прокуратуры и суда
  cyber_executed_presentations?: number; // из них исполнено (подготовлен ответ)

  createdAt?: Date;
  updatedAt?: Date;
}

export interface OperationalActivityWithRelations extends OperationalActivityAttributes {
  department?: DepartmentModelType;
}

export interface OperationalActivityCreationAttributes extends Optional<OperationalActivityAttributes, 'id'> {}

export interface OperationalActivityInstance
  extends Model<OperationalActivityAttributes, OperationalActivityCreationAttributes>,
    OperationalActivityWithRelations {}

const OperationalActivity = sequelize.define<OperationalActivityInstance>(
  'operational_activities',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Уникальный код операционной деятельности (формат: OA-DDMMYYYY-HHmmss)'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'department_id',
      },
      comment: 'Подразделение',
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID пользователя, создавшего операционную деятельность (из Keycloak)',
    },
    period_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Период с',
    },
    period_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Период по',
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(OperationalActivityDirectionEnum)],
      },
      comment: 'Направление безопасности (ЭБ/ИБ/БПиО)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание операционной деятельности',
    },
    entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Дата внесения операционной деятельности',
    },

    // ЭБ - DEBT_RECOVERY
    total_debt: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    overdue_debt: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    overdue_debt_sb: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    recovered_debt: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    available_vat: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    vat_assistance: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    written_off_debt: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    prevented_writeoff: { type: DataTypes.DECIMAL(15, 2), allowNull: true },

    // ЭБ - LAW_ENFORCEMENT
    incoming_requests: { type: DataTypes.INTEGER, allowNull: true },
    executed_requests: { type: DataTypes.INTEGER, allowNull: true },
    executed_tasks: { type: DataTypes.INTEGER, allowNull: true },
    received_presentations: { type: DataTypes.INTEGER, allowNull: true },
    executed_presentations: { type: DataTypes.INTEGER, allowNull: true },

    // ЭБ - INVESTMENT_CONTROL
    checked_entities_new: { type: DataTypes.INTEGER, allowNull: true },
    negative_conclusions_new: { type: DataTypes.INTEGER, allowNull: true },
    checked_entities_active: { type: DataTypes.INTEGER, allowNull: true },
    negative_conclusions_active: { type: DataTypes.INTEGER, allowNull: true },
    checked_draft_contracts: { type: DataTypes.INTEGER, allowNull: true },
    not_approved_drafts: { type: DataTypes.INTEGER, allowNull: true },
    checked_active_contracts: { type: DataTypes.INTEGER, allowNull: true },
    not_approved_active: { type: DataTypes.INTEGER, allowNull: true },
    planned_budget: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    procurement_procedures_count: { type: DataTypes.INTEGER, allowNull: true },
    single_source_count: { type: DataTypes.INTEGER, allowNull: true },
    procurement_procedures_sum: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    single_source_sum: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    cost_reduction: { type: DataTypes.DECIMAL(15, 2), allowNull: true },

    // ЭБ - AFFILIATION
    checked_employees: { type: DataTypes.INTEGER, allowNull: true },
    found_affiliated: { type: DataTypes.INTEGER, allowNull: true },
    checked_candidates: { type: DataTypes.INTEGER, allowNull: true },
    rejected_candidates: { type: DataTypes.INTEGER, allowNull: true },
    rejected_affiliated: { type: DataTypes.INTEGER, allowNull: true },

    // ЭБ - CITIZEN_APPEALS
    total_appeals: { type: DataTypes.INTEGER, allowNull: true },
    zon_applications: { type: DataTypes.INTEGER, allowNull: true },
    fictitious_contracts: { type: DataTypes.INTEGER, allowNull: true },
    termination_requests: { type: DataTypes.INTEGER, allowNull: true },
    beautiful_numbers: { type: DataTypes.INTEGER, allowNull: true },
    sim_replacement: { type: DataTypes.INTEGER, allowNull: true },
    refund_requests: { type: DataTypes.INTEGER, allowNull: true },
    other_appeals: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - INSPECTIONS
    ib_incident_checks: { type: DataTypes.INTEGER, allowNull: true },
    planned_ib_checks: { type: DataTypes.INTEGER, allowNull: true },
    non_compliances: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - VIOLATORS_MEASURES
    warnings: { type: DataTypes.INTEGER, allowNull: true },
    remarks: { type: DataTypes.INTEGER, allowNull: true },
    reprimands: { type: DataTypes.INTEGER, allowNull: true },
    dismissals: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - ACCESS_APPROVALS
    approved_accesses: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - MEMOS_PREPARED
    memos_count: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - RISK_MINIMIZATION
    audit_security_control_count: { type: DataTypes.INTEGER, allowNull: true, comment: 'Проведение аудита и контроль защищённости информационной инфраструктуры ИС (кол-во)' },
    work_status_result_count: { type: DataTypes.INTEGER, allowNull: true, comment: 'Описание статуса и/или результата проводимых работ в рамках данной задачи (кол-во)' },
    scanned_count: { type: DataTypes.INTEGER, allowNull: true },
    vulnerabilities_found: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - CT_KI_PROTECTION
    ct_ki_description: { type: DataTypes.TEXT, allowNull: true },
    confidential_docs: { type: DataTypes.INTEGER, allowNull: true },
    compliance_checks: { type: DataTypes.INTEGER, allowNull: true },
    ct_ki_protection_count: { type: DataTypes.INTEGER, allowNull: true, comment: 'Реализация режима защиты КТ и КИ (кол-во)' },

    // ИБ - AWARENESS_RAISING
    awareness_description: { type: DataTypes.TEXT, allowNull: true },
    awareness_count: { type: DataTypes.INTEGER, allowNull: true, comment: 'Повышение осведомленности в области ИБ сотрудников компании (кол-во)' },

    // ИБ - ACCESS_CONTROL
    access_control_description: { type: DataTypes.TEXT, allowNull: true },
    access_requests: { type: DataTypes.INTEGER, allowNull: true },
    access_violations: { type: DataTypes.INTEGER, allowNull: true },
    account_audits: { type: DataTypes.INTEGER, allowNull: true },
    violations_found: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - INCIDENT_MONITORING
    processed_incidents: { type: DataTypes.INTEGER, allowNull: true },
    admin_rights_incidents: { type: DataTypes.INTEGER, allowNull: true },
    kspd_access_incidents: { type: DataTypes.INTEGER, allowNull: true },
    spam_incidents: { type: DataTypes.INTEGER, allowNull: true },
    virus_incidents: { type: DataTypes.INTEGER, allowNull: true },
    software_incidents: { type: DataTypes.INTEGER, allowNull: true },
    ki_pdn_incidents: { type: DataTypes.INTEGER, allowNull: true },
    network_attacks_incidents: { type: DataTypes.INTEGER, allowNull: true },
    leaks_found: { type: DataTypes.INTEGER, allowNull: true },
    blocked_threats: { type: DataTypes.INTEGER, allowNull: true },
    other_incidents: { type: DataTypes.INTEGER, allowNull: true },
    other_incidents_description: { type: DataTypes.TEXT, allowNull: true },

    // ИБ - FRAUD_PREVENTION
    fraud_incidents: { type: DataTypes.INTEGER, allowNull: true },
    fraud_description: { type: DataTypes.TEXT, allowNull: true },

    // ИБ - INFRASTRUCTURE_ANALYSIS
    analyzed_documents: { type: DataTypes.INTEGER, allowNull: true },

    // ИБ - RISK_ANALYSIS
    risk_analysis_description: { type: DataTypes.TEXT, allowNull: true },

    // ИБ - PROJECT_ACTIVITIES
    project_status_description: { type: DataTypes.TEXT, allowNull: true },
    normative_docs_update_description: { type: DataTypes.TEXT, allowNull: true, comment: 'Актуализация нормативной и справочной документации по линии ИБ (текст)' },
    normative_docs_list: { type: DataTypes.TEXT, allowNull: true, comment: 'Перечень и статус пересмотренных и/или утвержденных нормативных документов по ИБ (текст)' },

    // ИБ - SYSTEM_OPERATION
    support_contracts: { type: DataTypes.TEXT, allowNull: true },
    administration_activities: { type: DataTypes.TEXT, allowNull: true },
    other_administration: { type: DataTypes.TEXT, allowNull: true },
    system_failures: { type: DataTypes.TEXT, allowNull: true },

    // ИБ - OTHER_ACTIVITIES
    other_activities_description: { type: DataTypes.TEXT, allowNull: true },

    // БПиО - STAFF_COUNT
    staff_count: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - OBJECTS_COUNT
    objects_count: { type: DataTypes.INTEGER, allowNull: true },
    objects_physical_security: { type: DataTypes.INTEGER, allowNull: true },
    objects_panel_security: { type: DataTypes.INTEGER, allowNull: true },
    categorized_rooms_count: { type: DataTypes.INTEGER, allowNull: true, comment: 'Количество категорированных помещений' },

    // БПиО - CAPEX_BUDGET
    capex_allocated: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    capex_spent_current: { type: DataTypes.DECIMAL(15, 2), allowNull: true },

    // БПиО - OPEX_BUDGET
    opex_allocated: { type: DataTypes.DECIMAL(15, 2), allowNull: true },

    // БПиО - ATZ_INSPECTIONS
    atz_checks_pb: { type: DataTypes.INTEGER, allowNull: true },
    atz_checks_law: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - ATU_ATT
    atu_att_pb: { type: DataTypes.INTEGER, allowNull: true },
    atu_att_law: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - SECURITY_COMPANY
    chop_checks: { type: DataTypes.INTEGER, allowNull: true },
    chop_claims: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - INTRUSION
    intrusion_total: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_not_prevented: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_prevented: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_detained: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_damage: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    intrusion_prevented_damage: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    intrusion_recovered: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    intrusion_employees: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_penalties: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_dismissals: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_materials: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_cases_opened: { type: DataTypes.INTEGER, allowNull: true },
    intrusion_cases_closed: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - ATTACK
    attack_total: { type: DataTypes.INTEGER, allowNull: true },
    attack_not_prevented: { type: DataTypes.INTEGER, allowNull: true },
    attack_prevented: { type: DataTypes.INTEGER, allowNull: true },
    attack_detained: { type: DataTypes.INTEGER, allowNull: true },
    attack_damage: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    attack_prevented_damage: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    attack_recovered: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    attack_employees: { type: DataTypes.INTEGER, allowNull: true },
    attack_penalties: { type: DataTypes.INTEGER, allowNull: true },
    attack_dismissals: { type: DataTypes.INTEGER, allowNull: true },
    attack_materials: { type: DataTypes.INTEGER, allowNull: true },
    attack_cases_opened: { type: DataTypes.INTEGER, allowNull: true },
    attack_cases_closed: { type: DataTypes.INTEGER, allowNull: true },

    // БПиО - INVESTIGATIONS
    investigations_count: { type: DataTypes.INTEGER, allowNull: true },

    // КБ - LAW_ENFORCEMENT
    cyber_incoming_paper_requests: { type: DataTypes.INTEGER, allowNull: true },
    cyber_executed_paper_requests: { type: DataTypes.INTEGER, allowNull: true },
    cyber_executed_paper_tasks: { type: DataTypes.INTEGER, allowNull: true },
    cyber_received_presentations: { type: DataTypes.INTEGER, allowNull: true },
    cyber_executed_presentations: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    timestamps: true,
    tableName: 'operational_activities',
  }
);

export default OperationalActivity;


