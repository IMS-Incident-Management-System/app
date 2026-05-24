-- Миграция для добавления поля is_service_investigation_ib в таблицу events
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_service_investigation_ib BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_service_investigation_ib') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_service_investigation_ib IS ''Служебные расследования ИБ''';
    END IF;
  END IF;
END $$;
