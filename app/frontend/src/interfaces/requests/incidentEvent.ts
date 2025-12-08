import { CriminalCaseAttributes } from "./criminalCase";
import { IncidentEventTypeTree } from "./incidentEventType";
import { IncidentAttributes } from "./incident";
import { ObjectAttributes } from "./object";
import { TheftTypeAttributes } from "./theft";

export interface IncidentEventAttributes {
  id: number;
  incident_id: number;
  event_type_id: number;
  sub_type_id?: number;
  description?: string;
  date: Date;
  entry_date?: Date;             // Дата внесения инцидента
  // Поля адреса
  city?: string;
  street?: string;
  house?: string;
  building?: string;
  apartment?: string;
  // Поля персональных данных
  last_name?: string;           // Фамилия
  first_name?: string;          // Имя
  middle_name?: string;         // Отчество
  employee_number?: string;     // Табельный номер
  // Поля ущерба
  detected_damage: number;      // Выявленный ущерб
  prevented_damage: number;     // Предотвращенный ущерб
  recovered_damage: number;     // Возмещенный ущерб
}

export interface IncidentEventWithRelations extends IncidentEventAttributes {
  event_type?: IncidentEventTypeTree;
  object?: ObjectAttributes;
  incident?: IncidentAttributes;
  criminal_cases?: CriminalCaseAttributes[];
  sub_type?: TheftTypeAttributes;
  createdAt?: Date;
  updatedAt?: Date;
}


