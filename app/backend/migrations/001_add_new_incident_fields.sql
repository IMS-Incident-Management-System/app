-- Миграция: Добавление новых полей и таблиц для инцидентов
-- Дата: 2025-10-12

-- 1. Добавляем новые поля в таблицу incidents
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS source_last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_middle_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_position VARCHAR(255);

-- 2. Создаем таблицу для адресов инцидентов
CREATE TABLE IF NOT EXISTS incident_addresses (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  city VARCHAR(255),
  street VARCHAR(255),
  house VARCHAR(255),
  building VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_incident_addresses_incident_id ON incident_addresses(incident_id);

-- 3. Создаем таблицу для персональных данных
CREATE TABLE IF NOT EXISTS incident_persons (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  employee_number VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_incident_persons_incident_id ON incident_persons(incident_id);

-- 4. Создаем таблицу для уголовных дел
CREATE TABLE IF NOT EXISTS criminal_cases (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER NOT NULL REFERENCES additionally(id) ON DELETE CASCADE,
  transfer_date TIMESTAMP,
  document_number VARCHAR(255),
  department_name VARCHAR(255),
  review_result TEXT,
  case_number VARCHAR(255),
  law_article VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_criminal_cases_additionally_id ON criminal_cases(additionally_id);

-- 5. Создаем таблицу для наказаний
CREATE TABLE IF NOT EXISTS punishments (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER NOT NULL REFERENCES additionally(id) ON DELETE CASCADE,
  punishment_type_id INTEGER NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  fired_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_punishments_additionally_id ON punishments(additionally_id);

-- 6. Удаляем старые поля из additionally (если они существуют)
ALTER TABLE additionally DROP COLUMN IF EXISTS criminal_cases;
ALTER TABLE additionally DROP COLUMN IF EXISTS is_punished;

-- Комментарии для документации
COMMENT ON COLUMN incidents.description IS 'Описание инцидента';
COMMENT ON COLUMN incidents.source_last_name IS 'Фамилия источника информации';
COMMENT ON COLUMN incidents.source_first_name IS 'Имя источника информации';
COMMENT ON COLUMN incidents.source_middle_name IS 'Отчество источника информации';
COMMENT ON COLUMN incidents.source_position IS 'Должность источника информации';

COMMENT ON TABLE incident_addresses IS 'Адреса инцидентов';
COMMENT ON TABLE incident_persons IS 'Персональные данные связанные с инцидентами';
COMMENT ON TABLE criminal_cases IS 'Уголовные дела';
COMMENT ON TABLE punishments IS 'Наказания';

