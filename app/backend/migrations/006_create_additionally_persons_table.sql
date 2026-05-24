-- Миграция: Создание таблицы для фигурантов дополнений к инцидентам
-- Дата: 2025-10-16

-- Создаем таблицу для фигурантов дополнений (без внешнего ключа сначала)
CREATE TABLE IF NOT EXISTS additionally_persons (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  birth_date DATE,
  employee_number VARCHAR(255)
);

-- Добавляем внешний ключ только если таблица additionally существует
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_name = 'additionally_persons_additionally_id_fkey'
    ) THEN
      ALTER TABLE additionally_persons 
      ADD CONSTRAINT additionally_persons_additionally_id_fkey 
      FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
    END IF;
    
    -- Добавляем NOT NULL только если таблица существует
    ALTER TABLE additionally_persons 
    ALTER COLUMN additionally_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_additionally_persons_additionally_id ON additionally_persons(additionally_id);

-- Комментарии
COMMENT ON TABLE additionally_persons IS 'Фигуранты дополнений к инцидентам';
COMMENT ON COLUMN additionally_persons.last_name IS 'Фамилия';
COMMENT ON COLUMN additionally_persons.first_name IS 'Имя';
COMMENT ON COLUMN additionally_persons.middle_name IS 'Отчество';
COMMENT ON COLUMN additionally_persons.birth_date IS 'Дата рождения';
COMMENT ON COLUMN additionally_persons.employee_number IS 'Табельный номер';

