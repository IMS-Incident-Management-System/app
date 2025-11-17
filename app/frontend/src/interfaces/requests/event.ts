import {
  EEventDirection,
  EEventCategory,
} from "../../enums/event";

// Фильтры для списка событий
export type TEventFilter = Partial<{
  department_id: number;
  direction: EEventDirection;
  category: EEventCategory;
  period_from: string;
  period_to: string;
  created_by: string;
}>;

// Базовые атрибуты события
export interface EventAttributes {
  id: number;
  department_id: number;
  created_by?: string;
  period_from: string; // DATEONLY формат - период с
  period_to: string; // DATEONLY формат - период по
  direction: EEventDirection;
  category: EEventCategory;
  description?: string; // Описание события

  // ====== ЭБ - DEBT_RECOVERY ======
  total_debt?: number;
  overdue_debt?: number;
  overdue_debt_sb?: number;
  recovered_debt?: number;
  available_vat?: number;
  vat_assistance?: number;
  written_off_debt?: number;
  prevented_writeoff?: number;

  // ====== ЭБ - LAW_ENFORCEMENT ======
  incoming_requests?: number;
  executed_requests?: number;
  executed_tasks?: number;
  received_presentations?: number;
  executed_presentations?: number;

  // ====== ЭБ - INVESTMENT_CONTROL ======
  checked_entities_new?: number;
  negative_conclusions_new?: number;
  checked_entities_active?: number;
  negative_conclusions_active?: number;
  checked_draft_contracts?: number;
  not_approved_drafts?: number;
  checked_active_contracts?: number;
  not_approved_active?: number;
  planned_budget?: number;
  procurement_procedures_count?: number;
  single_source_count?: number;
  procurement_procedures_sum?: number;
  single_source_sum?: number;
  cost_reduction?: number;

  // ====== ЭБ - AFFILIATION ======
  checked_employees?: number;
  found_affiliated?: number;
  checked_candidates?: number;
  rejected_candidates?: number;
  rejected_affiliated?: number;

  // ====== ЭБ - CITIZEN_APPEALS ======
  total_appeals?: number;
  zon_applications?: number;
  fictitious_contracts?: number;
  termination_requests?: number;
  beautiful_numbers?: number;
  sim_replacement?: number;
  refund_requests?: number;
  other_appeals?: number;

  // ====== ИБ - INSPECTIONS ======
  ib_incident_checks?: number;
  planned_ib_checks?: number;
  non_compliances?: number;

  // ====== ИБ - VIOLATORS_MEASURES ======
  warnings?: number;
  remarks?: number;
  reprimands?: number;
  dismissals?: number;

  // ====== ИБ - ACCESS_APPROVALS ======
  approved_accesses?: number;

  // ====== ИБ - MEMOS_PREPARED ======
  memos_count?: number;

  // ====== ИБ - RISK_MINIMIZATION ======
  audit_description?: string;
  scanned_count?: number;
  vulnerabilities_found?: number;

  // ====== ИБ - CT_KI_PROTECTION ======
  ct_ki_description?: string;
  confidential_docs?: number;
  compliance_checks?: number;

  // ====== ИБ - AWARENESS_RAISING ======
  awareness_description?: string;

  // ====== ИБ - ACCESS_CONTROL ======
  access_control_description?: string;
  access_requests?: number;
  access_violations?: number;
  account_audits?: number;
  violations_found?: number;

  // ====== ИБ - INCIDENT_MONITORING ======
  processed_incidents?: number;
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

  // ====== ИБ - FRAUD_PREVENTION ======
  fraud_incidents?: number;
  fraud_description?: string;

  // ====== ИБ - INFRASTRUCTURE_ANALYSIS ======
  analyzed_documents?: number;

  // ====== ИБ - RISK_ANALYSIS ======
  risk_analysis_description?: string;

  // ====== ИБ - PROJECT_ACTIVITIES ======
  project_status_description?: string;
  normative_docs_list?: string;

  // ====== ИБ - SYSTEM_OPERATION ======
  support_contracts?: string;
  administration_activities?: string;
  other_administration?: string;
  system_failures?: string;

  // ====== ИБ - OTHER_ACTIVITIES ======
  other_activities_description?: string;

  // ====== БПиО - STAFF_COUNT ======
  staff_count?: number;

  // ====== БПиО - OBJECTS_COUNT ======
  objects_physical_security?: number;
  objects_panel_security?: number;

  // ====== БПиО - CAPEX_BUDGET ======
  capex_allocated?: number;
  capex_spent_current?: number;

  // ====== БПиО - OPEX_BUDGET ======
  opex_allocated?: number;

  // ====== БПиО - ATZ_INSPECTIONS ======
  atz_checks_pb?: number;
  atz_checks_law?: number;

  // ====== БПиО - ATU_ATT ======
  atu_att_pb?: number;
  atu_att_law?: number;

  // ====== БПиО - SECURITY_COMPANY ======
  chop_checks?: number;
  chop_claims?: number;

  // ====== БПиО - INTRUSION ======
  intrusion_total?: number;
  intrusion_not_prevented?: number;
  intrusion_prevented?: number;
  intrusion_detained?: number;
  intrusion_damage?: number;
  intrusion_prevented_damage?: number;
  intrusion_recovered?: number;
  intrusion_employees?: number;
  intrusion_penalties?: number;
  intrusion_dismissals?: number;
  intrusion_materials?: number;
  intrusion_cases_opened?: number;
  intrusion_cases_closed?: number;

  // ====== БПиО - ATTACK ======
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

  // ====== БПиО - INVESTIGATIONS ======
  investigations_count?: number;

  createdAt?: string;
  updatedAt?: string;
}

// Интерфейс для подразделения
export interface EventDepartmentAttributes {
  id: number;
  title: string;
  parent_id: number | null;
}

// Событие со связями
export interface EventWithRelations extends EventAttributes {
  department?: EventDepartmentAttributes;
}

// Тело запроса для создания/обновления события
export interface CreateEventBody extends Omit<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  // Все поля опциональны кроме обязательных
}

// Ответ при создании события
export interface CreateEventResponse {
  event: EventAttributes;
}

