import { EIncidentDirection, EIncidentStatus } from "../../enums/incident";
import { EventHistoryWithRelations } from "./eventHistory";
import { ObjectAttributes } from "./object";
import { AdditionallyAttributes } from "./additionally";

export type TIncidentFilter = Partial<{
  department_id: number;
  direction: EIncidentDirection;
  object_type_id: number;
  event_type_id: number;
  date_from: string;
  date_to: string;
}>;

export interface IncidentAttributes {
  id: number;
  department_id: number;
  direction: EIncidentDirection;
  object_type_id?: number;
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
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
  object_type?: { title: string; object_type_id: number };
  events?: EventHistoryWithRelations[];
  additionally?: AdditionallyAttributes[];
  addresses?: IncidentAddressAttributes[];
  persons?: IncidentPersonAttributes[];
}

export interface IncidentAddressAttributes {
  id?: number;
  city?: string;
  street?: string;
  house?: string;
  building?: string;
}

export interface IncidentPersonAttributes {
  id?: number;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  employee_number?: string;
}

export interface CriminalCaseAttributes {
  id?: number;
  transfer_date?: Date;
  document_number?: string;
  department_name?: string;
  review_result?: string;
  case_number?: string;
  law_article?: string;
}

export interface PunishmentAttributes {
  id?: number;
  punishment_type_id: number;
  description?: string;
  date: Date;
  fired_count: number;
}

export interface CreateIncidentBody {
  department_id: number;
  direction: EIncidentDirection;
  object_type_id?: number;
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  event: {
    event_type_ids: number[];
    sub_type_id?: number;
    date: Date;
    entry_date?: Date;
  };
  addresses?: IncidentAddressAttributes[];
  persons?: IncidentPersonAttributes[];
  additionally: Array<{
    id?: number; // ID записи (исключается при создании)
    incident_date?: Date; // Дата происшествия
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
    criminal_cases_list?: CriminalCaseAttributes[];
    punishments?: PunishmentAttributes[];
  }>;
}

export interface CreateIncidentResponse {
  incident: IncidentAttributes;
  events: EventHistoryWithRelations[];
  additionally: AdditionallyAttributes[];
}