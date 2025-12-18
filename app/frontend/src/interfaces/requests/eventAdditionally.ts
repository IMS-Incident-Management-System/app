import { EventCriminalCaseAttributes } from "./event";
import { EventPunishmentAttributes } from "./event";
import { EventAdditionallyPersonAttributes } from "./eventAdditionallyPerson";

export interface EventAdditionallyAttributes {
  id: number;
  event_id: number;
  incident_date?: Date;
  addition_date?: Date;
  text_field?: string;
  detected_damage?: number;
  prevented_damage?: number;
  recovered_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  criminal_case?: EventCriminalCaseAttributes;
  punishment?: EventPunishmentAttributes;
  persons?: EventAdditionallyPersonAttributes[];
  createdAt?: Date;
  updatedAt?: Date;
}

