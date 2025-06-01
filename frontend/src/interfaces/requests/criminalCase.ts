export interface CriminalCaseAttributes {
  id: number;
  event_history_id: number; // Теперь только связь с событием

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
