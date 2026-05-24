-- Миграция: Добавление поля description в таблицу events
-- Дата: 2025-01-XX

-- Добавляем поле description в таблицу events (только если таблица существует)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS description TEXT;
    
    -- Комментарий для документации
    EXECUTE 'COMMENT ON COLUMN events.description IS ''Описание события''';
  END IF;
END $$;

