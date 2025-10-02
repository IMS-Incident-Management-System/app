import { CriminalCaseAttributes } from "./criminalCase";
import { EventTypeTree } from "./eventType";
import { IncidentAttributes } from "./incident";
import { ObjectAttributes } from "./object";
import { TheftTypeAttributes } from "./theft";

export interface EventHistoryAttributes {
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

export interface EventHistoryWithRelations extends EventHistoryAttributes {
  event_type?: EventTypeTree;
  object?: ObjectAttributes;
  incident?: IncidentAttributes;
  criminal_cases?: CriminalCaseAttributes[];
  sub_type?: TheftTypeAttributes;
  createdAt?: Date;
  updatedAt?: Date;
}
