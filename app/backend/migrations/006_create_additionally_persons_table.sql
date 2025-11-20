-- Миграция: Создание таблицы для фигурантов дополнений к инцидентам
-- Дата: 2025-10-16

-- Создаем таблицу для фигурантов дополнений
CREATE TABLE IF NOT EXISTS additionally_persons (
  id SERIAL PRIMARY KEY,
  additionally_id INTEGER NOT NULL REFERENCES additionally(id) ON DELETE CASCADE,
  last_name VARCHAR(255),
  first_name VARCHAR(255),
  middle_name VARCHAR(255),
  birth_date DATE,
  employee_number VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_additionally_persons_additionally_id ON additionally_persons(additionally_id);

-- Комментарии
COMMENT ON TABLE additionally_persons IS 'Фигуранты дополнений к инцидентам';
COMMENT ON COLUMN additionally_persons.last_name IS 'Фамилия';
COMMENT ON COLUMN additionally_persons.first_name IS 'Имя';
COMMENT ON COLUMN additionally_persons.middle_name IS 'Отчество';
COMMENT ON COLUMN additionally_persons.birth_date IS 'Дата рождения';
COMMENT ON COLUMN additionally_persons.employee_number IS 'Табельный номер';

