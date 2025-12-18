// Типы операционной деятельности (используем тот же енум что и у инцидентов)
export enum OperationalActivityDirectionEnum {
  ECONOMIC = 'ECONOMIC', // ЭБ
  INFORMATION = 'INFORMATION', // ИБ
  SECURITY = 'SECURITY', // БПиО
  CYBER = 'CYBER', // КБ
  ANTIFRAUD = 'ANTIFRAUD', // Антифрод
  SORM = 'SORM', // СОРМ
}

// Категории операционной деятельности для ЭБ
export enum OperationalActivityCategoryEconomicEnum {
  DEBT_RECOVERY = 'DEBT_RECOVERY', // Работа по возмещению ДЗ и НДС
  // LAW_ENFORCEMENT = 'LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами - временно отключено
  INVESTMENT_CONTROL = 'INVESTMENT_CONTROL', // Контроль инвестиционной, закупочной и договорной деятельности
  AFFILIATION = 'AFFILIATION', // Работа по выявлению признаков аффилированности
  CITIZEN_APPEALS = 'CITIZEN_APPEALS', // Работа с обращениями граждан
}

// Категории операционной деятельности для ИБ
export enum OperationalActivityCategoryInformationEnum {
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

// Категории операционной деятельности для БПиО
export enum OperationalActivityCategorySecurityEnum {
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

// Категории операционной деятельности для КБ
export enum OperationalActivityCategoryCyberEnum {
  CYBER_LAW_ENFORCEMENT = 'CYBER_LAW_ENFORCEMENT', // Взаимодействие с правоохранительными органами
}


