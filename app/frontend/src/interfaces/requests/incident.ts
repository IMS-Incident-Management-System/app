import { EIncidentDirection, EIncidentStatus } from "../../enums/incident";
import { IncidentEventWithRelations } from "./incidentEvent";
import { ObjectAttributes } from "./object";
import { AdditionallyAttributes } from "./additionally";
import { AdditionallyPersonAttributes } from "./additionallyPerson";

export type TIncidentFilter = Partial<{
  department_id: number;
  direction: EIncidentDirection;
  object_type_id: number;
  event_type_id: number;
  date_from: string;
  date_to: string;
  code?: string;
}>;

export interface IncidentAttributes {
  id: number;
  code?: string; // Уникальный код инцидента (формат: IN-DDMMYYYY-HHmmss)
  department_id: number;
  direction: EIncidentDirection;
  object_type_id?: number;
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
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
  object_type?: { title: string; object_type_id: number }; // Для обратной совместимости
  object_types?: Array<{ title: string; object_type_id: number }>; // Массив типов объектов
  events?: IncidentEventWithRelations[];
  additionally?: AdditionallyAttributes[];
  addresses?: IncidentAddressAttributes[];
  persons?: IncidentPersonAttributes[];
  attachments?: IncidentAttachmentAttributes[];
}

export interface IncidentAddressAttributes {
  id?: number;
  city?: string;
  street?: string;
  house?: string;
  building?: string;
  apartment?: string;
}

export interface IncidentPersonAttributes {
  id?: number;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  employee_number?: string;
  outcome_type?: 'injury' | 'fatal'; // Травма / Смертельный исход
}

export interface IncidentAttachmentAttributes {
  id: number;
  incident_id: number;
  filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}

export interface CriminalCaseAttributes {
  id?: number;
  
  // Данные о передаче материалов
  transfer_date?: Date; // Дата передачи материалов в ПРоО
  document_number?: string; // Номер вх./исх. документа или Номер КУСП
  department_name?: string; // Наименование подразделения, куда переданы материалы
  
  // Результаты рассмотрения
  review_result?: string; // Результат рассмотрения материалов
  rejection_date?: Date; // Дата отказа в ВУД/ВАД
  rejection_reason?: string; // Причина отказа в ВУД/ВАД
  appeal_date?: Date; // Дата обжалования отказа в ВУД/ВАД
  
  // Данные уголовного/административного дела
  case_date?: Date; // Дата ВУД/ВАД
  case_number?: string; // Номер УД/АД
  law_article?: string; // Статья УКРФ/КоАПРФ
  initiator?: string; // Инициатор возбуждения УД/АД
  subject?: string; // Субъект преступления УД/АД
  detained_count?: number; // Задержано, чел.
  
  // Данные о привлекаемом лице
  person_name?: string; // ФИО лица (название юр.лица), привлекаемого к УО/АО
  
  // Результаты рассмотрения дела
  case_result?: string; // Результат рассмотрения УД/АД
  court_decision?: string; // Решение (приговор) суда
  convicted_count?: number; // Осуждено, чел.
}

export interface PunishmentAttributes {
  id?: number;
  guilty_persons_count?: number; // Установлено виновных лиц – кол-во
  employees_involved_count?: number; // Установлено сотрудников, причастных к инциденту
  detained_persons_count?: number; // Задержаны лица при совершении правонарушения
  measures_taken_count?: number; // Принято мер к виновным лицам – кол-во
  warning_letter_rp398?: number; // Предупреждение предупредительным письмом по РП-398
  remark?: number; // Замечание
  reprimand?: number; // Выговор
  dismissed_count?: number; // Уволено – кол-во
}

export interface CreateIncidentBody {
  department_id: number;
  direction: EIncidentDirection;
  object_type_id?: number; // Оставляем для обратной совместимости
  object_type_ids?: number[]; // Массив типов объектов для множественного выбора
  is_db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
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
    addition_date?: Date; // Дата внесения дополнения к инциденту
    text_field?: string; // Текстовое поле
    detected_damage?: number; // Выявленный ущерб
    prevented_damage?: number; // Предотвращенный ущерб
    recovered_damage?: number; // Возмещенный ущерб
    additional_income?: number; // Получен дополнительный доход (руб.)
    reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
    criminal_case?: CriminalCaseAttributes;
    punishment?: PunishmentAttributes;
    persons?: AdditionallyPersonAttributes[]; // ФИО фигурантов
  }>;
}

export interface CreateIncidentResponse {
  incident: IncidentAttributes;
  events: IncidentEventWithRelations[];
  additionally: AdditionallyAttributes[];
}