// Направления событий (типы)
export enum EEventDirection {
  ECONOMIC = 'ECONOMIC', // ЭБ
  INFORMATION = 'INFORMATION', // ИБ
  SECURITY = 'SECURITY', // БПиО
  CYBER = 'CYBER', // КБ
  ANTIFRAUD = 'ANTIFRAUD', // Антифрод
  SORM = 'SORM', // СОРМ
}

// Категории событий для ЭБ (Экономическая безопасность)
export enum EEventCategoryEconomic {
  DEBT_RECOVERY = 'DEBT_RECOVERY', // Работа по возмещению ДЗ и НДС
  // LAW_ENFORCEMENT = 'LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами - временно отключено
  INVESTMENT_CONTROL = 'INVESTMENT_CONTROL', // Контроль инвестиционной, закупочной и договорной деятельности
  AFFILIATION = 'AFFILIATION', // Работа по выявлению признаков аффилированности
  CITIZEN_APPEALS = 'CITIZEN_APPEALS', // Работа с обращениями граждан
}

// Категории событий для ИБ (Информационная безопасность)
export enum EEventCategoryInformation {
  INSPECTIONS = 'INSPECTIONS', // Сведения об участии в проверочных мероприятиях
  VIOLATORS_MEASURES = 'VIOLATORS_MEASURES', // Меры, принятые к нарушителям
  ACCESS_APPROVALS = 'ACCESS_APPROVALS', // Количество согласованных доступов к информационным активам
  MEMOS_PREPARED = 'MEMOS_PREPARED', // Подготовлено служебных записок руководству
  RISK_MINIMIZATION = 'RISK_MINIMIZATION', // События и мероприятия, связанные с минимизацией рисков и угроз
  CT_KI_PROTECTION = 'CT_KI_PROTECTION', // Реализация режима защиты КТ и КИ
  AWARENESS_RAISING = 'AWARENESS_RAISING', // Повышение осведомленности в области ИБ
  ACCESS_CONTROL = 'ACCESS_CONTROL', // Контроль доступа к ИС и действий привилегированных пользователей
  INCIDENT_MONITORING = 'INCIDENT_MONITORING', // Мониторинг инцидентов ИБ
  FRAUD_PREVENTION = 'FRAUD_PREVENTION', // Мероприятия по противодействию фроду
  INFRASTRUCTURE_ANALYSIS = 'INFRASTRUCTURE_ANALYSIS', // Анализ изменений в информационной инфраструктуре
  RISK_ANALYSIS = 'RISK_ANALYSIS', // Анализ текущих рисков и угроз в сфере ИБ
  PROJECT_ACTIVITIES = 'PROJECT_ACTIVITIES', // Мероприятия по реализации проектной и нормотворческой деятельности
  SYSTEM_OPERATION = 'SYSTEM_OPERATION', // Мероприятия по эксплуатации средств и систем ИБ
  OTHER_ACTIVITIES = 'OTHER_ACTIVITIES', // Прочая деятельность
}

// Категории событий для БПиО (Безопасность и охрана)
export enum EEventCategorySecurity {
  STAFF_COUNT = 'STAFF_COUNT', // Штатное количество сотрудников безопасности
  OBJECTS_COUNT = 'OBJECTS_COUNT', // Количество объектов
  CAPEX_BUDGET = 'CAPEX_BUDGET', // Бюджет на усиление АТЗ объектов (CAPEX)
  OPEX_BUDGET = 'OPEX_BUDGET', // Бюджет на физ. охрану (OPEX)
  ATZ_INSPECTIONS = 'ATZ_INSPECTIONS', // Проведено проверок состояния АТЗ объектов
  ATU_ATT = 'ATU_ATT', // Проведено АТУ и АТТ на объектах
  SECURITY_COMPANY = 'SECURITY_COMPANY', // Взаимодействие с ЧОП/ЧОО
  INTRUSION = 'INTRUSION', // Проникновение на объект
  ATTACK = 'ATTACK', // Нападение на объект/сотрудников
  INVESTIGATIONS = 'INVESTIGATIONS', // Проведено проверок и СР
}

// Категории событий для КБ (Кибербезопасность)
export enum EEventCategoryCyber {
  CYBER_LAW_ENFORCEMENT = 'CYBER_LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами
}

// Общий тип для всех категорий
export type EEventCategory =
  | EEventCategoryEconomic
  | EEventCategoryInformation
  | EEventCategorySecurity
  | EEventCategoryCyber;

// Человекочитаемые названия направлений
export const EventDirectionLabels: Record<EEventDirection, string> = {
  [EEventDirection.ECONOMIC]: 'ЭБ',
  [EEventDirection.INFORMATION]: 'ИБ',
  [EEventDirection.SECURITY]: 'БПиО',
  [EEventDirection.CYBER]: 'КБ',
  [EEventDirection.ANTIFRAUD]: 'Антифрод',
  [EEventDirection.SORM]: 'СОРМ',
};

// Человекочитаемые названия категорий ЭБ
export const EventCategoryEconomicLabels: Record<EEventCategoryEconomic, string> = {
  [EEventCategoryEconomic.DEBT_RECOVERY]: 'Работа по возмещению ДЗ и НДС',
  // [EEventCategoryEconomic.LAW_ENFORCEMENT]: 'Взаимодействие с правоохранительными органами', // временно отключено
  [EEventCategoryEconomic.INVESTMENT_CONTROL]: 'Контроль инвестиционной, закупочной и договорной деятельности',
  [EEventCategoryEconomic.AFFILIATION]: 'Работа по выявлению признаков аффилированности',
  [EEventCategoryEconomic.CITIZEN_APPEALS]: 'Работа с обращениями граждан',
};

// Человекочитаемые названия категорий ИБ
export const EventCategoryInformationLabels: Record<EEventCategoryInformation, string> = {
  [EEventCategoryInformation.INSPECTIONS]: 'Сведения об участии в проверочных мероприятиях',
  [EEventCategoryInformation.VIOLATORS_MEASURES]: 'Меры, принятые к нарушителям',
  [EEventCategoryInformation.ACCESS_APPROVALS]: 'Количество согласованных доступов к информационным активам',
  [EEventCategoryInformation.MEMOS_PREPARED]: 'Подготовлено служебных записок руководству',
  [EEventCategoryInformation.RISK_MINIMIZATION]: 'События и мероприятия, связанные с минимизацией рисков и угроз',
  [EEventCategoryInformation.CT_KI_PROTECTION]: 'Реализация режима защиты КТ и КИ',
  [EEventCategoryInformation.AWARENESS_RAISING]: 'Повышение осведомленности в области ИБ',
  [EEventCategoryInformation.ACCESS_CONTROL]: 'Контроль доступа к ИС и действий привилегированных пользователей',
  [EEventCategoryInformation.INCIDENT_MONITORING]: 'Мониторинг инцидентов ИБ',
  [EEventCategoryInformation.FRAUD_PREVENTION]: 'Мероприятия по противодействию фроду',
  [EEventCategoryInformation.INFRASTRUCTURE_ANALYSIS]: 'Анализ изменений в информационной инфраструктуре',
  [EEventCategoryInformation.RISK_ANALYSIS]: 'Анализ текущих рисков и угроз в сфере ИБ',
  [EEventCategoryInformation.PROJECT_ACTIVITIES]: 'Мероприятия по реализации проектной и нормотворческой деятельности',
  [EEventCategoryInformation.SYSTEM_OPERATION]: 'Мероприятия по эксплуатации средств и систем ИБ',
  [EEventCategoryInformation.OTHER_ACTIVITIES]: 'Прочая деятельность',
};

// Человекочитаемые названия категорий БПиО
export const EventCategorySecurityLabels: Record<EEventCategorySecurity, string> = {
  [EEventCategorySecurity.STAFF_COUNT]: 'Штатное количество сотрудников безопасности',
  [EEventCategorySecurity.OBJECTS_COUNT]: 'Количество объектов',
  [EEventCategorySecurity.CAPEX_BUDGET]: 'Бюджет на усиление АТЗ объектов (CAPEX)',
  [EEventCategorySecurity.OPEX_BUDGET]: 'Бюджет на физ. охрану (OPEX)',
  [EEventCategorySecurity.ATZ_INSPECTIONS]: 'Проведено проверок состояния АТЗ объектов',
  [EEventCategorySecurity.ATU_ATT]: 'Проведено АТУ и АТТ на объектах',
  [EEventCategorySecurity.SECURITY_COMPANY]: 'Взаимодействие с ЧОП/ЧОО',
  [EEventCategorySecurity.INTRUSION]: 'Проникновение на объект',
  [EEventCategorySecurity.ATTACK]: 'Нападение на объект/сотрудников',
  [EEventCategorySecurity.INVESTIGATIONS]: 'Проведено проверок и СР',
};

// Человекочитаемые названия категорий КБ
export const EventCategoryCyberLabels: Record<EEventCategoryCyber, string> = {
  [EEventCategoryCyber.CYBER_LAW_ENFORCEMENT]: 'Взаимодействие с правоохранительными органами',
};

// Получить категории по направлению
export const getCategoriesByDirection = (direction: EEventDirection): EEventCategory[] => {
  switch (direction) {
    case EEventDirection.ECONOMIC:
      return Object.values(EEventCategoryEconomic);
    case EEventDirection.INFORMATION:
      return Object.values(EEventCategoryInformation);
    case EEventDirection.SECURITY:
      return Object.values(EEventCategorySecurity);
    case EEventDirection.CYBER:
      return Object.values(EEventCategoryCyber);
    case EEventDirection.ANTIFRAUD:
    case EEventDirection.SORM:
      // Для новых направлений пока нет категорий
      return [];
    default:
      return [];
  }
};

// Получить название категории
export const getCategoryLabel = (category: string | EEventCategory): string => {
  if (!category) return 'Не указано';
  
  return (
    EventCategoryEconomicLabels[category as EEventCategoryEconomic] ||
    EventCategoryInformationLabels[category as EEventCategoryInformation] ||
    EventCategorySecurityLabels[category as EEventCategorySecurity] ||
    EventCategoryCyberLabels[category as EEventCategoryCyber] ||
    category
  );
};

