import { CriminalCaseAttributes } from "./criminalCase";
import { EventTypeAttributes } from "./eventType";
import { IncidentAttributes } from "./incident";
import { ObjectAttributes } from "./object";
import { TheftTypeAttributes } from "./theft";

export interface EventHistoryAttributes {
  id: number;
  incident_id: number;
  event_type_id: number;
  object_id: number;
  damage_amount: number;
  compensation_amount: number;
  sub_type_id?: number;
  description?: string;
  date: Date;
}

export interface EventHistoryWithRelations extends EventHistoryAttributes {
  event_type?: EventTypeAttributes;
  object?: ObjectAttributes;
  incident?: IncidentAttributes;
  criminal_cases?: CriminalCaseAttributes[];
  sub_type?: TheftTypeAttributes;
}
