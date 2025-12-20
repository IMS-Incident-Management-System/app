-- Миграция для добавления поля is_db в таблицу events
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_db BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_db') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_db IS ''Флаг "Особо важно" (1ДБ). Указывает на особый статус события, требующий специальной обработки''';
    END IF;
  END IF;
END $$;

