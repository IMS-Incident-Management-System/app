// Направления операционной деятельности (типы)
export enum EOperationalActivityDirection {
  ECONOMIC = 'ECONOMIC', // ЭБ
  INFORMATION = 'INFORMATION', // ИБ
  SECURITY = 'SECURITY', // БПиО
  CYBER = 'CYBER', // КБ
  ANTIFRAUD = 'ANTIFRAUD', // Антифрод
  SORM = 'SORM', // СОРМ
}

// Категории операционной деятельности для ЭБ (Экономическая безопасность)
export enum EOperationalActivityCategoryEconomic {
  DEBT_RECOVERY = 'DEBT_RECOVERY', // Работа по возмещению ДЗ и НДС
  // LAW_ENFORCEMENT = 'LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами - временно отключено
  INVESTMENT_CONTROL = 'INVESTMENT_CONTROL', // Контроль инвестиционной, закупочной и договорной деятельности
  AFFILIATION = 'AFFILIATION', // Работа по выявлению признаков аффилированности
  CITIZEN_APPEALS = 'CITIZEN_APPEALS', // Работа с обращениями граждан
}

// Категории операционной деятельности для ИБ (Информационная безопасность)
export enum EOperationalActivityCategoryInformation {
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

// Категории операционной деятельности для БПиО (Безопасность и охрана)
export enum EOperationalActivityCategorySecurity {
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

// Категории операционной деятельности для КБ (Кибербезопасность)
export enum EOperationalActivityCategoryCyber {
  CYBER_LAW_ENFORCEMENT = 'CYBER_LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами
}

// Общий тип для всех категорий
export type EOperationalActivityCategory =
  | EOperationalActivityCategoryEconomic
  | EOperationalActivityCategoryInformation
  | EOperationalActivityCategorySecurity
  | EOperationalActivityCategoryCyber;

// Человекочитаемые названия направлений
export const OperationalActivityDirectionLabels: Record<EOperationalActivityDirection, string> = {
  [EOperationalActivityDirection.ECONOMIC]: 'ЭБ',
  [EOperationalActivityDirection.INFORMATION]: 'ИБ',
  [EOperationalActivityDirection.SECURITY]: 'БПиО',
  [EOperationalActivityDirection.CYBER]: 'КБ',
  [EOperationalActivityDirection.ANTIFRAUD]: 'Антифрод',
  [EOperationalActivityDirection.SORM]: 'СОРМ',
};

// Человекочитаемые названия категорий ЭБ
export const OperationalActivityCategoryEconomicLabels: Record<EOperationalActivityCategoryEconomic, string> = {
  [EOperationalActivityCategoryEconomic.DEBT_RECOVERY]: 'Работа по возмещению ДЗ и НДС',
  // [EOperationalActivityCategoryEconomic.LAW_ENFORCEMENT]: 'Взаимодействие с правоохранительными органами', // временно отключено
  [EOperationalActivityCategoryEconomic.INVESTMENT_CONTROL]: 'Контроль инвестиционной, закупочной и договорной деятельности',
  [EOperationalActivityCategoryEconomic.AFFILIATION]: 'Работа по выявлению признаков аффилированности',
  [EOperationalActivityCategoryEconomic.CITIZEN_APPEALS]: 'Работа с обращениями граждан',
};

// Человекочитаемые названия категорий ИБ
export const OperationalActivityCategoryInformationLabels: Record<EOperationalActivityCategoryInformation, string> = {
  [EOperationalActivityCategoryInformation.INSPECTIONS]: 'Сведения об участии в проверочных мероприятиях',
  [EOperationalActivityCategoryInformation.VIOLATORS_MEASURES]: 'Меры, принятые к нарушителям',
  [EOperationalActivityCategoryInformation.ACCESS_APPROVALS]: 'Количество согласованных доступов к информационным активам',
  [EOperationalActivityCategoryInformation.MEMOS_PREPARED]: 'Подготовлено служебных записок руководству',
  [EOperationalActivityCategoryInformation.RISK_MINIMIZATION]: 'События и мероприятия, связанные с минимизацией рисков и угроз',
  [EOperationalActivityCategoryInformation.CT_KI_PROTECTION]: 'Реализация режима защиты КТ и КИ',
  [EOperationalActivityCategoryInformation.AWARENESS_RAISING]: 'Повышение осведомленности в области ИБ',
  [EOperationalActivityCategoryInformation.ACCESS_CONTROL]: 'Контроль доступа к ИС и действий привилегированных пользователей',
  [EOperationalActivityCategoryInformation.INCIDENT_MONITORING]: 'Мониторинг инцидентов ИБ',
  [EOperationalActivityCategoryInformation.FRAUD_PREVENTION]: 'Мероприятия по противодействию фроду',
  [EOperationalActivityCategoryInformation.INFRASTRUCTURE_ANALYSIS]: 'Анализ изменений в информационной инфраструктуре',
  [EOperationalActivityCategoryInformation.RISK_ANALYSIS]: 'Анализ текущих рисков и угроз в сфере ИБ',
  [EOperationalActivityCategoryInformation.PROJECT_ACTIVITIES]: 'Мероприятия по реализации проектной и нормотворческой деятельности',
  [EOperationalActivityCategoryInformation.SYSTEM_OPERATION]: 'Мероприятия по эксплуатации средств и систем ИБ',
  [EOperationalActivityCategoryInformation.OTHER_ACTIVITIES]: 'Прочая деятельность',
};

// Человекочитаемые названия категорий БПиО
export const OperationalActivityCategorySecurityLabels: Record<EOperationalActivityCategorySecurity, string> = {
  [EOperationalActivityCategorySecurity.STAFF_COUNT]: 'Штатное количество сотрудников безопасности',
  [EOperationalActivityCategorySecurity.OBJECTS_COUNT]: 'Количество объектов',
  [EOperationalActivityCategorySecurity.CAPEX_BUDGET]: 'Бюджет на усиление АТЗ объектов (CAPEX)',
  [EOperationalActivityCategorySecurity.OPEX_BUDGET]: 'Бюджет на физ. охрану (OPEX)',
  [EOperationalActivityCategorySecurity.ATZ_INSPECTIONS]: 'Проведено проверок состояния АТЗ объектов',
  [EOperationalActivityCategorySecurity.ATU_ATT]: 'Проведено АТУ и АТТ на объектах',
  [EOperationalActivityCategorySecurity.SECURITY_COMPANY]: 'Взаимодействие с ЧОП/ЧОО',
  [EOperationalActivityCategorySecurity.INTRUSION]: 'Проникновение на объект',
  [EOperationalActivityCategorySecurity.ATTACK]: 'Нападение на объект/сотрудников',
  [EOperationalActivityCategorySecurity.INVESTIGATIONS]: 'Проведено проверок и СР',
};

// Человекочитаемые названия категорий КБ
export const OperationalActivityCategoryCyberLabels: Record<EOperationalActivityCategoryCyber, string> = {
  [EOperationalActivityCategoryCyber.CYBER_LAW_ENFORCEMENT]: 'Взаимодействие с правоохранительными органами',
};

// Получить категории по направлению
export const getCategoriesByDirection = (direction: EOperationalActivityDirection): EOperationalActivityCategory[] => {
  switch (direction) {
    case EOperationalActivityDirection.ECONOMIC:
      return Object.values(EOperationalActivityCategoryEconomic);
    case EOperationalActivityDirection.INFORMATION:
      return Object.values(EOperationalActivityCategoryInformation);
    case EOperationalActivityDirection.SECURITY:
      return Object.values(EOperationalActivityCategorySecurity);
    case EOperationalActivityDirection.CYBER:
      return Object.values(EOperationalActivityCategoryCyber);
    case EOperationalActivityDirection.ANTIFRAUD:
    case EOperationalActivityDirection.SORM:
      // Для новых направлений пока нет категорий
      return [];
    default:
      return [];
  }
};

// Получить название категории
export const getCategoryLabel = (category: string | EOperationalActivityCategory): string => {
  if (!category) return 'Не указано';
  
  return (
    OperationalActivityCategoryEconomicLabels[category as EOperationalActivityCategoryEconomic] ||
    OperationalActivityCategoryInformationLabels[category as EOperationalActivityCategoryInformation] ||
    OperationalActivityCategorySecurityLabels[category as EOperationalActivityCategorySecurity] ||
    OperationalActivityCategoryCyberLabels[category as EOperationalActivityCategoryCyber] ||
    category
  );
};


