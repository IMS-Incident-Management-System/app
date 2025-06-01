export interface PunishmentAttributes {
  id: number;
  incident_id: number;
  guilty_persons_count: number;
  punished_persons_count: number;
  warnings_count: number;
  reprimands_count: number;
  severe_reprimands_count: number;
  fired_count: number;
  date: Date;
}
