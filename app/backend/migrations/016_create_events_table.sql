-- Миграция для создания таблиц событий (События)
-- Создана: 2024
-- Примечание: Эта миграция создает начальную структуру, которая будет изменена в миграции 017
-- (event_additionally будет удалена, criminal_cases и punishments будут связаны напрямую с events)

-- Удаляем старые таблицы только если они существуют (для чистой миграции или пересоздания)
-- ВАЖНО: В продакшене эти DROP могут удалить данные, используйте с осторожностью!
DO $$
BEGIN
  -- Удаляем только если таблицы действительно существуют
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally_persons') THEN
    DROP TABLE event_additionally_persons CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    DROP TABLE event_punishments CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_criminal_cases') THEN
    DROP TABLE event_criminal_cases CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally') THEN
    DROP TABLE event_additionally CASCADE;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    DROP TABLE events CASCADE;
  END IF;
END $$;

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

-- Комментарии для таблицы events
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    EXECUTE 'COMMENT ON TABLE events IS ''Таблица событий''';
    EXECUTE 'COMMENT ON COLUMN events.department_id IS ''Подразделение''';
    EXECUTE 'COMMENT ON COLUMN events."date" IS ''Дата события''';
    EXECUTE 'COMMENT ON COLUMN events.is_service_investigation IS ''Служебные расследования''';
    EXECUTE 'COMMENT ON COLUMN events.is_service_check IS ''Служебные проверки''';
    EXECUTE 'COMMENT ON COLUMN events.is_service_check_ib IS ''Служебные проверки по линии ИБ''';
    EXECUTE 'COMMENT ON COLUMN events.is_verification_activity IS ''Проверочные мероприятия''';
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'quantity') THEN
      EXECUTE 'COMMENT ON COLUMN events.quantity IS ''Количество – текстовое поле''';
    END IF;
    EXECUTE 'COMMENT ON COLUMN events.description IS ''Текстовое поле для описания События''';
    EXECUTE 'COMMENT ON COLUMN events.detected_damage IS ''Выявлен ущерб (руб.)''';
    EXECUTE 'COMMENT ON COLUMN events.recovered_damage IS ''Возмещен ущерб (руб.)''';
    EXECUTE 'COMMENT ON COLUMN events.prevented_damage IS ''Предотвращен ущерб (руб.)''';
    EXECUTE 'COMMENT ON COLUMN events.additional_income IS ''Получен дополнительный доход (руб.)''';
    EXECUTE 'COMMENT ON COLUMN events.reduced_cost IS ''Снижена стоимость товаров, работ и услуг на сумму (руб.)''';
    EXECUTE 'COMMENT ON COLUMN events.prevented_unnecessary_writeoff IS ''Предотвращено необ. списание ДЗ, руб.''';
    EXECUTE 'COMMENT ON COLUMN events.vat_deducted IS ''Принят к вычету НДС, руб.''';
  END IF;
END $$;

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

-- Комментарии для event_additionally (будет удалена в миграции 017)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally') THEN
    EXECUTE 'COMMENT ON TABLE event_additionally IS ''Дополнения к событиям''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.event_id IS ''ID события''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.incident_date IS ''Дата происшествия''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.addition_date IS ''Дата внесения дополнения к событию''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.text_field IS ''Текстовое поле''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.detected_damage IS ''Выявленный ущерб''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.prevented_damage IS ''Предотвращенный ущерб''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.recovered_damage IS ''Возмещенный ущерб''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.additional_income IS ''Получен дополнительный доход (руб.)''';
    EXECUTE 'COMMENT ON COLUMN event_additionally.reduced_cost IS ''Снижена стоимость товаров, работ и услуг на сумму (руб.)''';
  END IF;
END $$;

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

-- Комментарии для event_criminal_cases (будет пересоздана в миграции 017 с прямой связью)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_criminal_cases') THEN
    EXECUTE 'COMMENT ON TABLE event_criminal_cases IS ''Уголовные дела для событий''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.event_additionally_id IS ''ID дополнения к событию''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.transfer_date IS ''Дата передачи материалов в ПРоО''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.document_number IS ''Номер вх./исх. документа или Номер КУСП''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.department_name IS ''Наименование подразделения, куда переданы материалы''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.review_result IS ''Результат рассмотрения материалов''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.rejection_date IS ''Дата отказа в ВУД/ВАД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.rejection_reason IS ''Причина отказа в ВУД/ВАД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.appeal_date IS ''Дата обжалования отказа в ВУД/ВАД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.case_date IS ''Дата ВУД/ВАД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.case_number IS ''Номер УД/АД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.law_article IS ''Статья УКРФ/КоАПРФ''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.initiator IS ''Инициатор возбуждения УД/АД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.subject IS ''Субъект преступления УД/АД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.detained_count IS ''Задержано, чел.''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.person_name IS ''ФИО лица (название юр.лица), привлекаемого к УО/АО''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.case_result IS ''Результат рассмотрения УД/АД''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.court_decision IS ''Решение (приговор) суда''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.convicted_count IS ''Осуждено, чел.''';
  END IF;
END $$;

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

-- Комментарии для event_punishments (будет пересоздана в миграции 017 с прямой связью)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    EXECUTE 'COMMENT ON TABLE event_punishments IS ''Наказания для событий''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.event_additionally_id IS ''ID дополнения к событию''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.guilty_persons_count IS ''Установлено виновных лиц – кол-во''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.measures_taken_count IS ''Принято мер к виновным лицам – кол-во''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.warning_letter_rp398 IS ''Предупреждение предупредительным письмом по РП-398''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.remark IS ''Замечание''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.reprimand IS ''Выговор''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.dismissed_count IS ''Уволено – кол-во''';
  END IF;
END $$;

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

-- Комментарии для event_additionally_persons (будет удалена в миграции 017)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally_persons') THEN
    EXECUTE 'COMMENT ON TABLE event_additionally_persons IS ''Фигуранты дополнений к событиям''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.event_additionally_id IS ''ID дополнения к событию''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.last_name IS ''Фамилия''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.first_name IS ''Имя''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.middle_name IS ''Отчество''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.birth_date IS ''Дата рождения''';
    EXECUTE 'COMMENT ON COLUMN event_additionally_persons.employee_number IS ''Табельный номер''';
  END IF;
END $$;

-- Создаем индексы для оптимизации запросов
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE INDEX IF NOT EXISTS idx_events_department_id ON events(department_id);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events("date");
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally') THEN
    CREATE INDEX IF NOT EXISTS idx_event_additionally_event_id ON event_additionally(event_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_criminal_cases') THEN
    CREATE INDEX IF NOT EXISTS idx_event_criminal_cases_additionally_id ON event_criminal_cases(event_additionally_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    CREATE INDEX IF NOT EXISTS idx_event_punishments_additionally_id ON event_punishments(event_additionally_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally_persons') THEN
    CREATE INDEX IF NOT EXISTS idx_event_additionally_persons_additionally_id ON event_additionally_persons(event_additionally_id);
  END IF;
END $$;

