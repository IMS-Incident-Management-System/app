-- Миграция для добавления полей типов событий БПиО в таблицу events
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    -- Служебные расследования БПиО
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_service_investigation_bpio BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_service_investigation_bpio') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_service_investigation_bpio IS ''Служебные расследования БПиО''';
    END IF;

    -- Служебная проверка БПиО
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_service_check_bpio BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_service_check_bpio') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_service_check_bpio IS ''Служебная проверка БПиО''';
    END IF;

    -- Служебные расследования БПиО (горячая линия)
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_service_investigation_bpio_hotline BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_service_investigation_bpio_hotline') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_service_investigation_bpio_hotline IS ''Служебные расследования БПиО (горячая линия)''';
    END IF;

    -- Служебная проверка БПиО (горячая линия)
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS is_service_check_bpio_hotline BOOLEAN NOT NULL DEFAULT FALSE;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_service_check_bpio_hotline') THEN
      EXECUTE 'COMMENT ON COLUMN events.is_service_check_bpio_hotline IS ''Служебная проверка БПиО (горячая линия)''';
    END IF;
  END IF;
END $$;
