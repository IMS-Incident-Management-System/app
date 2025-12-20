-- Миграция для изменения структуры: УД и наказания напрямую связаны с событием
-- Создана: 2024

-- Удаляем старые таблицы
DROP TABLE IF EXISTS event_additionally_persons CASCADE;
DROP TABLE IF EXISTS event_punishments CASCADE;
DROP TABLE IF EXISTS event_criminal_cases CASCADE;
DROP TABLE IF EXISTS event_additionally CASCADE;

-- Создаем новую таблицу event_criminal_cases с прямой связью с events
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE TABLE IF NOT EXISTS event_criminal_cases (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL,
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
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Добавляем внешний ключ
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'fk_event_criminal_case_event'
    ) THEN
      ALTER TABLE event_criminal_cases
      ADD CONSTRAINT fk_event_criminal_case_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Комментарии для event_criminal_cases
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_criminal_cases') THEN
    EXECUTE 'COMMENT ON TABLE event_criminal_cases IS ''Уголовные дела для событий''';
    EXECUTE 'COMMENT ON COLUMN event_criminal_cases.event_id IS ''ID события''';
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

-- Создаем новую таблицу event_punishments с прямой связью с events
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    CREATE TABLE IF NOT EXISTS event_punishments (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL,
      guilty_persons_count INTEGER DEFAULT 0,
      measures_taken_count INTEGER DEFAULT 0,
      warning_letter_rp398 INTEGER DEFAULT 0,
      remark INTEGER DEFAULT 0,
      reprimand INTEGER DEFAULT 0,
      dismissed_count INTEGER DEFAULT 0
    );

    -- Добавляем внешний ключ
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'fk_event_punishment_event'
    ) THEN
      ALTER TABLE event_punishments
      ADD CONSTRAINT fk_event_punishment_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Комментарии для event_punishments
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    EXECUTE 'COMMENT ON TABLE event_punishments IS ''Наказания для событий''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.event_id IS ''ID события''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.guilty_persons_count IS ''Установлено виновных лиц – кол-во''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.measures_taken_count IS ''Принято мер к виновным лицам – кол-во''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.warning_letter_rp398 IS ''Предупреждение предупредительным письмом по РП-398''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.remark IS ''Замечание''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.reprimand IS ''Выговор''';
    EXECUTE 'COMMENT ON COLUMN event_punishments.dismissed_count IS ''Уволено – кол-во''';
  END IF;
END $$;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_event_criminal_cases_event_id ON event_criminal_cases(event_id);
CREATE INDEX IF NOT EXISTS idx_event_punishments_event_id ON event_punishments(event_id);

