-- Миграция для добавления поля categorized_rooms_count в таблицу operational_activities
-- Создана: 2024

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'operational_activities') THEN
    ALTER TABLE operational_activities
    ADD COLUMN IF NOT EXISTS categorized_rooms_count INTEGER;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operational_activities' AND column_name = 'categorized_rooms_count') THEN
      EXECUTE 'COMMENT ON COLUMN operational_activities.categorized_rooms_count IS ''Количество категорированных помещений''';
    END IF;
  END IF;
END $$;
