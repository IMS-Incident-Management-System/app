import { EIncidentDirection, EIncidentStatus } from "../../enums/incident";
import { EventHistoryWithRelations } from "./eventHistory";
import { ObjectAttributes } from "./object";
import { PunishmentAttributes } from "./punishment";

export type TIncidentFilter = Partial<{
  department_id: number;
  direction: EIncidentDirection;
  status: EIncidentStatus;
  date_from: string;
  date_to: string;
}>;

export interface IncidentAttributes {
  id: number;
  department_id: number;
  direction: EIncidentDirection;
  object_id: number;
  message: string;
  is_db: boolean;
  status: EIncidentStatus;
  createdAt: Date;
}

export interface IncidentDepartmentAttributes {
  id: number;
  title: string;
  parent_id: number | null;
}

export interface IncidentWithRelations extends IncidentAttributes {
  department?: IncidentDepartmentAttributes;
  object?: ObjectAttributes;
  events?: EventHistoryWithRelations[];
  punishments?: PunishmentAttributes[];
}

export interface CreateIncidentBody {
  department_id: number;
  direction: EIncidentDirection;
  status: EIncidentStatus;
  object_id: number;
  message: string;
  is_db: boolean;
  events: Array<{
    event_type_id: number;
    sub_type_id?: number;
    damage_amount: number;
    object_id: number;
    compensation_amount: number;
    description?: string;
    date: Date;
    criminal_cases?: Array<{
      transfer_date?: Date;
      document_number?: string;
      department_name?: string;
      review_result?: string;
      case_number?: string;
      law_article?: string;
      [key: string]: any;
    }>;
  }>;
  punishments?: Array<{
    guilty_persons_count: number;
    punished_persons_count: number;
    warnings_count: number;
    reprimands_count: number;
    severe_reprimands_count: number;
    fired_count: number;
    date: Date;
  }>;
}

export interface CreateIncidentResponse {
  incident: IncidentAttributes;
  events: EventHistoryWithRelations[];
  punishments: PunishmentAttributes[];
}