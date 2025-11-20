-- Миграция: Добавление поля description в таблицу events
-- Дата: 2025-01-XX

-- Добавляем поле description в таблицу events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Комментарий для документации
COMMENT ON COLUMN events.description IS 'Описание события';

