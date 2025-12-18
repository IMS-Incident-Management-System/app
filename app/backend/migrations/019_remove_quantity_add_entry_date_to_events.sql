-- Миграция для удаления поля quantity и добавления entry_date в таблицу events
-- Создана: 2024

-- Удаляем поле quantity
ALTER TABLE events
DROP COLUMN IF EXISTS quantity;

-- Добавляем поле entry_date (дата внесения)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS entry_date DATE;

COMMENT ON COLUMN events.entry_date IS 'Дата внесения события';

