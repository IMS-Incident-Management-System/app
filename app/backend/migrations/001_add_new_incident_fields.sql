-- Миграция: Добавление новых полей и таблиц для инцидентов
-- Дата: 2025-10-12

-- 1. Добавляем новые поля в таблицу incidents (только если таблица существует)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS source_last_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS source_first_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS source_middle_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS source_position VARCHAR(255);
  END IF;
END $$;

-- 2. Создаем таблицу для адресов инцидентов
CREATE TABLE IF NOT EXISTS incident_addresses (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER,
  city VARCHAR(255),
  street VARCHAR(255),
  house VARCHAR(255),
  building VARCHAR(255),
  apartment VARCHAR(255)
);

-- Добавляем внешний ключ только если таблица incidents существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    -- Проверяем, существует ли уже внешний ключ
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'incident_addresses_incident_id_fkey'
    ) THEN
      ALTER TABLE incident_addresses 
      ADD CONSTRAINT incident_addresses_incident_id_fkey 
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incident_addresses_incident_id ON incident_addresses(incident_id);

-- 3. Создаем таблицу для персональных данных
CREATE TABLE IF NOT EXISTS incident_persons (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  employee_number VARCHAR(255)
);

-- Добавляем внешний ключ только если таблица incidents существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'incident_persons_incident_id_fkey'
    ) THEN
      ALTER TABLE incident_persons 
      ADD CONSTRAINT incident_persons_incident_id_fkey 
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incident_persons_incident_id ON incident_persons(incident_id);

-- 4. Создаем таблицу для уголовных дел
CREATE TABLE IF NOT EXISTS criminal_cases (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER,
  transfer_date TIMESTAMP,
  document_number VARCHAR(255),
  department_name VARCHAR(255),
  review_result TEXT,
  case_number VARCHAR(255),
  law_article VARCHAR(255)
);

-- Добавляем внешний ключ только если таблица additionally существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'criminal_cases_additionally_id_fkey'
    ) THEN
      ALTER TABLE criminal_cases 
      ADD CONSTRAINT criminal_cases_additionally_id_fkey 
      FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_criminal_cases_additionally_id ON criminal_cases(additionally_id);

-- 5. Создаем таблицу для наказаний
CREATE TABLE IF NOT EXISTS punishments (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER,
  punishment_type_id INTEGER NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  fired_count INTEGER NOT NULL DEFAULT 0
);

-- Добавляем внешний ключ только если таблица additionally существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'punishments_additionally_id_fkey'
    ) THEN
      ALTER TABLE punishments 
      ADD CONSTRAINT punishments_additionally_id_fkey 
      FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_punishments_additionally_id ON punishments(additionally_id);

-- 6. Удаляем старые поля из additionally (если они существуют)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    ALTER TABLE additionally DROP COLUMN IF EXISTS criminal_cases;
    ALTER TABLE additionally DROP COLUMN IF EXISTS is_punished;
  END IF;
END $$;

-- Комментарии для документации (только если таблицы существуют)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'description') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.description IS ''Описание инцидента''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'source_last_name') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.source_last_name IS ''Фамилия источника информации''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'source_first_name') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.source_first_name IS ''Имя источника информации''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'source_middle_name') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.source_middle_name IS ''Отчество источника информации''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'source_position') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.source_position IS ''Должность источника информации''';
    END IF;
  END IF;
END $$;

COMMENT ON TABLE incident_addresses IS 'Адреса инцидентов';
COMMENT ON TABLE incident_persons IS 'Персональные данные связанные с инцидентами';
COMMENT ON TABLE criminal_cases IS 'Уголовные дела';
COMMENT ON TABLE punishments IS 'Наказания';

