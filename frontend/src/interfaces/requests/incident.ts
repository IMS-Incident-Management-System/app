import { EIncidentDirection, EIncidentStatus } from "../../enums/incident";
import { DepartmentModelType } from "./department";
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

export interface IncidentWithRelations extends IncidentAttributes {
  department?: DepartmentModelType;
  object?: ObjectAttributes;
  events?: EventHistoryWithRelations[];
  punishments?: PunishmentAttributes[];
}
