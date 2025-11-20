-- Миграция: Исправление структуры таблиц criminal_cases и punishments
-- Дата: 2025-10-12

-- 1. Удаляем старые таблицы если они есть (с неправильной структурой)
DROP TABLE IF EXISTS criminal_cases CASCADE;
DROP TABLE IF EXISTS punishments CASCADE;

-- 2. Создаем таблицу для уголовных дел (без внешнего ключа, если таблица additionally не существует)
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

-- Добавляем внешний ключ и NOT NULL только если таблица additionally существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    -- Добавляем внешний ключ
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'criminal_cases_additionally_id_fkey'
    ) THEN
      ALTER TABLE criminal_cases 
      ADD CONSTRAINT criminal_cases_additionally_id_fkey 
      FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем NOT NULL
    ALTER TABLE criminal_cases 
    ALTER COLUMN additionally_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_criminal_cases_additionally_id ON criminal_cases(additionally_id);

-- 3. Создаем таблицу для наказаний (без внешнего ключа, если таблица additionally не существует)
CREATE TABLE IF NOT EXISTS punishments (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER,
  punishment_type_id INTEGER NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  fired_count INTEGER NOT NULL DEFAULT 0
);

-- Добавляем внешний ключ и NOT NULL только если таблица additionally существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    -- Добавляем внешний ключ
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'punishments_additionally_id_fkey'
    ) THEN
      ALTER TABLE punishments 
      ADD CONSTRAINT punishments_additionally_id_fkey 
      FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем NOT NULL
    ALTER TABLE punishments 
    ALTER COLUMN additionally_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_punishments_additionally_id ON punishments(additionally_id);

-- Комментарии
COMMENT ON TABLE criminal_cases IS 'Уголовные дела';
COMMENT ON TABLE punishments IS 'Наказания';

