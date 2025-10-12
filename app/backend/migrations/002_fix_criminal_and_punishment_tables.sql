-- Миграция: Исправление структуры таблиц criminal_cases и punishments
-- Дата: 2025-10-12

-- 1. Удаляем старые таблицы если они есть (с неправильной структурой)
DROP TABLE IF EXISTS criminal_cases CASCADE;
DROP TABLE IF EXISTS punishments CASCADE;

-- 2. Создаем таблицу для уголовных дел с правильной структурой
CREATE TABLE criminal_cases (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER NOT NULL REFERENCES additionally(id) ON DELETE CASCADE,
  transfer_date TIMESTAMP,
  document_number VARCHAR(255),
  department_name VARCHAR(255),
  review_result TEXT,
  case_number VARCHAR(255),
  law_article VARCHAR(255)
);

CREATE INDEX idx_criminal_cases_additionally_id ON criminal_cases(additionally_id);

-- 3. Создаем таблицу для наказаний с правильной структурой
CREATE TABLE punishments (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER NOT NULL REFERENCES additionally(id) ON DELETE CASCADE,
  punishment_type_id INTEGER NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  fired_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_punishments_additionally_id ON punishments(additionally_id);

-- Комментарии
COMMENT ON TABLE criminal_cases IS 'Уголовные дела';
COMMENT ON TABLE punishments IS 'Наказания';

