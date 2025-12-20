-- Миграция для удаления поля quantity и добавления entry_date в таблицу events
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    -- Удаляем поле quantity
    ALTER TABLE events
    DROP COLUMN IF EXISTS quantity;

    -- Добавляем поле entry_date (дата внесения)
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS entry_date DATE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'entry_date') THEN
      EXECUTE 'COMMENT ON COLUMN events.entry_date IS ''Дата внесения события''';
    END IF;
  END IF;
END $$;

