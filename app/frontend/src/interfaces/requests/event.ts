
export type TEventFilter = Partial<{
  department_id: number;
  date_from: string;
  date_to: string;
}>;

export interface EventAttributes {
  id: number;
  department_id: number;
  date: Date;
  is_service_investigation: boolean;
  is_service_check: boolean;
  is_service_check_ib: boolean;
  is_verification_activity: boolean;
  quantity?: string;
  description?: string;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  prevented_unnecessary_writeoff?: number;
  vat_deducted?: number;
  createdAt: Date;
}

export interface EventDepartmentAttributes {
  id: number;
  title: string;
  parent_id: number | null;
}

export interface EventWithRelations extends EventAttributes {
  department?: EventDepartmentAttributes;
  criminal_case?: EventCriminalCaseAttributes;
  punishment?: EventPunishmentAttributes;
}

export interface EventCriminalCaseAttributes {
  id?: number;
  transfer_date?: Date;
  document_number?: string;
  department_name?: string;
  review_result?: string;
  rejection_date?: Date;
  rejection_reason?: string;
  appeal_date?: Date;
  case_date?: Date;
  case_number?: string;
  law_article?: string;
  initiator?: string;
  subject?: string;
  detained_count?: number;
  person_name?: string;
  case_result?: string;
  court_decision?: string;
  convicted_count?: number;
}

export interface EventPunishmentAttributes {
  id?: number;
  guilty_persons_count?: number;
  measures_taken_count?: number;
  warning_letter_rp398?: number;
  remark?: number;
  reprimand?: number;
  dismissed_count?: number;
}

export interface CreateEventBody {
  department_id: number;
  date: Date;
  is_service_investigation: boolean;
  is_service_check: boolean;
  is_service_check_ib: boolean;
  is_verification_activity: boolean;
  quantity?: string;
  description?: string;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  prevented_unnecessary_writeoff?: number;
  vat_deducted?: number;
  criminal_case?: EventCriminalCaseAttributes;
  punishment?: EventPunishmentAttributes;
}

export interface CreateEventResponse {
  event: EventAttributes;
}

