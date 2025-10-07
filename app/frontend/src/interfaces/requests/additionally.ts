export interface AdditionallyAttributes {
  id: number;
  incident_id: number;
  incident_date?: Date; // Дата происшествия
  addition_date?: Date; // Дата внесения дополнения к инциденту
  text_field?: string; // Текстовое поле
  criminal_cases?: string; // Уголовные дела
  is_punished?: boolean; // Наказано
  detected_damage?: number; // Выявленный ущерб
  prevented_damage?: number; // Предотвращенный ущерб
  recovered_damage?: number; // Возмещенный ущерб
  createdAt?: Date;
  updatedAt?: Date;
}
