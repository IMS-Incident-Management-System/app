import { CriminalCaseAttributes, PunishmentAttributes } from './incident';
import { AdditionallyPersonAttributes } from './additionallyPerson';

export interface AdditionallyAttributes {
  id: number;
  incident_id: number;
  addition_date?: Date; // Дата внесения дополнения к инциденту
  text_field?: string; // Текстовое поле
  detected_damage?: number; // Выявленный ущерб
  prevented_damage?: number; // Предотвращенный ущерб
  recovered_damage?: number; // Возмещенный ущерб
  criminal_case?: CriminalCaseAttributes;
  punishment?: PunishmentAttributes;
  persons?: AdditionallyPersonAttributes[]; // ФИО фигурантов
  createdAt?: Date;
  updatedAt?: Date;
}
