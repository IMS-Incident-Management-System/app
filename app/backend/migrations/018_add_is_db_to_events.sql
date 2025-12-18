-- Миграция для добавления поля is_db в таблицу events
-- Создана: 2024

-- Добавляем поле is_db в таблицу events
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_db BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN events.is_db IS 'Флаг "Особо важно" (1ДБ). Указывает на особый статус события, требующий специальной обработки';

