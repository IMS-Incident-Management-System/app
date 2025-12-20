-- Миграция для создания таблиц событий (События)
-- Создана: 2024

-- Удаляем таблицу events, если она существует (для чистой миграции)
DROP TABLE IF EXISTS event_additionally_persons CASCADE;
DROP TABLE IF EXISTS event_punishments CASCADE;
DROP TABLE IF EXISTS event_criminal_cases CASCADE;
DROP TABLE IF EXISTS event_additionally CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Таблица events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL,
  "date" DATE NOT NULL,
  is_service_investigation BOOLEAN NOT NULL DEFAULT FALSE,
  is_service_check BOOLEAN NOT NULL DEFAULT FALSE,
  is_service_check_ib BOOLEAN NOT NULL DEFAULT FALSE,
  is_verification_activity BOOLEAN NOT NULL DEFAULT FALSE,
  quantity VARCHAR(255),
  description TEXT,
  detected_damage INTEGER DEFAULT 0,
  recovered_damage INTEGER DEFAULT 0,
  prevented_damage INTEGER DEFAULT 0,
  additional_income INTEGER DEFAULT 0,
  reduced_cost INTEGER DEFAULT 0,
  prevented_unnecessary_writeoff INTEGER DEFAULT 0,
  vat_deducted INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем внешний ключ только если таблица departments существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'fk_events_department'
    ) THEN
      ALTER TABLE events
      ADD CONSTRAINT fk_events_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

COMMENT ON TABLE events IS 'Таблица событий';
COMMENT ON COLUMN events.department_id IS 'Подразделение';
COMMENT ON COLUMN events."date" IS 'Дата события';
COMMENT ON COLUMN events.is_service_investigation IS 'Служебные расследования';
COMMENT ON COLUMN events.is_service_check IS 'Служебные проверки';
COMMENT ON COLUMN events.is_service_check_ib IS 'Служебные проверки по линии ИБ';
COMMENT ON COLUMN events.is_verification_activity IS 'Проверочные мероприятия';
COMMENT ON COLUMN events.quantity IS 'Количество – текстовое поле';
COMMENT ON COLUMN events.description IS 'Текстовое поле для описания События';
COMMENT ON COLUMN events.detected_damage IS 'Выявлен ущерб (руб.)';
COMMENT ON COLUMN events.recovered_damage IS 'Возмещен ущерб (руб.)';
COMMENT ON COLUMN events.prevented_damage IS 'Предотвращен ущерб (руб.)';
COMMENT ON COLUMN events.additional_income IS 'Получен дополнительный доход (руб.)';
COMMENT ON COLUMN events.reduced_cost IS 'Снижена стоимость товаров, работ и услуг на сумму (руб.)';
COMMENT ON COLUMN events.prevented_unnecessary_writeoff IS 'Предотвращено необ. списание ДЗ, руб.';
COMMENT ON COLUMN events.vat_deducted IS 'Принят к вычету НДС, руб.';

-- Таблица event_additionally
CREATE TABLE event_additionally (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  incident_date DATE,
  addition_date DATE,
  text_field TEXT,
  detected_damage INTEGER DEFAULT 0,
  prevented_damage INTEGER DEFAULT 0,
  recovered_damage INTEGER DEFAULT 0,
  additional_income INTEGER DEFAULT 0,
  reduced_cost INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_additionally_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

COMMENT ON TABLE event_additionally IS 'Дополнения к событиям';
COMMENT ON COLUMN event_additionally.event_id IS 'ID события';
COMMENT ON COLUMN event_additionally.incident_date IS 'Дата происшествия';
COMMENT ON COLUMN event_additionally.addition_date IS 'Дата внесения дополнения к событию';
COMMENT ON COLUMN event_additionally.text_field IS 'Текстовое поле';
COMMENT ON COLUMN event_additionally.detected_damage IS 'Выявленный ущерб';
COMMENT ON COLUMN event_additionally.prevented_damage IS 'Предотвращенный ущерб';
COMMENT ON COLUMN event_additionally.recovered_damage IS 'Возмещенный ущерб';
COMMENT ON COLUMN event_additionally.additional_income IS 'Получен дополнительный доход (руб.)';
COMMENT ON COLUMN event_additionally.reduced_cost IS 'Снижена стоимость товаров, работ и услуг на сумму (руб.)';

-- Таблица event_criminal_cases
CREATE TABLE event_criminal_cases (
  id SERIAL PRIMARY KEY,
  event_additionally_id INTEGER NOT NULL,
  transfer_date DATE,
  document_number VARCHAR(255),
  department_name VARCHAR(255),
  review_result TEXT,
  rejection_date DATE,
  rejection_reason TEXT,
  appeal_date DATE,
  case_date DATE,
  case_number VARCHAR(255),
  law_article VARCHAR(255),
  initiator VARCHAR(255),
  subject TEXT,
  detained_count INTEGER,
  person_name VARCHAR(255),
  case_result TEXT,
  court_decision TEXT,
  convicted_count INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_criminal_case_additionally FOREIGN KEY (event_additionally_id) REFERENCES event_additionally(id) ON DELETE CASCADE
);

COMMENT ON TABLE event_criminal_cases IS 'Уголовные дела для событий';
COMMENT ON COLUMN event_criminal_cases.event_additionally_id IS 'ID дополнения к событию';
COMMENT ON COLUMN event_criminal_cases.transfer_date IS 'Дата передачи материалов в ПРоО';
COMMENT ON COLUMN event_criminal_cases.document_number IS 'Номер вх./исх. документа или Номер КУСП';
COMMENT ON COLUMN event_criminal_cases.department_name IS 'Наименование подразделения, куда переданы материалы';
COMMENT ON COLUMN event_criminal_cases.review_result IS 'Результат рассмотрения материалов';
COMMENT ON COLUMN event_criminal_cases.rejection_date IS 'Дата отказа в ВУД/ВАД';
COMMENT ON COLUMN event_criminal_cases.rejection_reason IS 'Причина отказа в ВУД/ВАД';
COMMENT ON COLUMN event_criminal_cases.appeal_date IS 'Дата обжалования отказа в ВУД/ВАД';
COMMENT ON COLUMN event_criminal_cases.case_date IS 'Дата ВУД/ВАД';
COMMENT ON COLUMN event_criminal_cases.case_number IS 'Номер УД/АД';
COMMENT ON COLUMN event_criminal_cases.law_article IS 'Статья УКРФ/КоАПРФ';
COMMENT ON COLUMN event_criminal_cases.initiator IS 'Инициатор возбуждения УД/АД';
COMMENT ON COLUMN event_criminal_cases.subject IS 'Субъект преступления УД/АД';
COMMENT ON COLUMN event_criminal_cases.detained_count IS 'Задержано, чел.';
COMMENT ON COLUMN event_criminal_cases.person_name IS 'ФИО лица (название юр.лица), привлекаемого к УО/АО';
COMMENT ON COLUMN event_criminal_cases.case_result IS 'Результат рассмотрения УД/АД';
COMMENT ON COLUMN event_criminal_cases.court_decision IS 'Решение (приговор) суда';
COMMENT ON COLUMN event_criminal_cases.convicted_count IS 'Осуждено, чел.';

-- Таблица event_punishments
CREATE TABLE event_punishments (
  id SERIAL PRIMARY KEY,
  event_additionally_id INTEGER NOT NULL,
  guilty_persons_count INTEGER DEFAULT 0,
  measures_taken_count INTEGER DEFAULT 0,
  warning_letter_rp398 INTEGER DEFAULT 0,
  remark INTEGER DEFAULT 0,
  reprimand INTEGER DEFAULT 0,
  dismissed_count INTEGER DEFAULT 0,
  CONSTRAINT fk_event_punishment_additionally FOREIGN KEY (event_additionally_id) REFERENCES event_additionally(id) ON DELETE CASCADE
);

COMMENT ON TABLE event_punishments IS 'Наказания для событий';
COMMENT ON COLUMN event_punishments.event_additionally_id IS 'ID дополнения к событию';
COMMENT ON COLUMN event_punishments.guilty_persons_count IS 'Установлено виновных лиц – кол-во';
COMMENT ON COLUMN event_punishments.measures_taken_count IS 'Принято мер к виновным лицам – кол-во';
COMMENT ON COLUMN event_punishments.warning_letter_rp398 IS 'Предупреждение предупредительным письмом по РП-398';
COMMENT ON COLUMN event_punishments.remark IS 'Замечание';
COMMENT ON COLUMN event_punishments.reprimand IS 'Выговор';
COMMENT ON COLUMN event_punishments.dismissed_count IS 'Уволено – кол-во';

-- Таблица event_additionally_persons
CREATE TABLE event_additionally_persons (
  id SERIAL PRIMARY KEY,
  event_additionally_id INTEGER NOT NULL,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  birth_date DATE,
  employee_number VARCHAR(255),
  CONSTRAINT fk_event_additionally_person_additionally FOREIGN KEY (event_additionally_id) REFERENCES event_additionally(id) ON DELETE CASCADE
);

COMMENT ON TABLE event_additionally_persons IS 'Фигуранты дополнений к событиям';
COMMENT ON COLUMN event_additionally_persons.event_additionally_id IS 'ID дополнения к событию';
COMMENT ON COLUMN event_additionally_persons.last_name IS 'Фамилия';
COMMENT ON COLUMN event_additionally_persons.first_name IS 'Имя';
COMMENT ON COLUMN event_additionally_persons.middle_name IS 'Отчество';
COMMENT ON COLUMN event_additionally_persons.birth_date IS 'Дата рождения';
COMMENT ON COLUMN event_additionally_persons.employee_number IS 'Табельный номер';

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events("date");
CREATE INDEX IF NOT EXISTS idx_event_additionally_event_id ON event_additionally(event_id);
CREATE INDEX IF NOT EXISTS idx_event_criminal_cases_additionally_id ON event_criminal_cases(event_additionally_id);
CREATE INDEX IF NOT EXISTS idx_event_punishments_additionally_id ON event_punishments(event_additionally_id);
CREATE INDEX IF NOT EXISTS idx_event_additionally_persons_additionally_id ON event_additionally_persons(event_additionally_id);

