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
  additionally?: AdditionallyAttributes[];
}

export interface CreateIncidentBody {
  department_id: number;
  direction: EIncidentDirection;
  object_type_id?: number;
  is_db: boolean;
  event: {
    event_type_ids: number[];
    sub_type_id?: number;
    date: Date;
    entry_date?: Date;
    // адрес
    city?: string;
    street?: string;
    house?: string;
    building?: string;
    apartment?: string;
    // персональные данные
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    employee_number?: string;
  };
  additionally: Array<{
    id?: number; // ID записи (исключается при создании)
    incident_date?: Date; // Дата происшествия
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    criminal_cases?: string; // Уголовные дела
    is_punished?: boolean; // Наказано
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
  }>;
}

export interface CreateIncidentResponse {
  incident: IncidentAttributes;
  events: EventHistoryWithRelations[];
  additionally: AdditionallyAttributes[];
}