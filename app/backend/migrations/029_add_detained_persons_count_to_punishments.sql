-- Миграция для добавления поля detained_persons_count в таблицы punishments и event_punishments
-- Создана: 2024

DO $$
BEGIN
  -- Добавляем поле в таблицу punishments (для дополнений к инцидентам)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'punishments') THEN
    ALTER TABLE punishments
    ADD COLUMN IF NOT EXISTS detained_persons_count INTEGER;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'detained_persons_count') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.detained_persons_count IS ''Задержаны лица при совершении правонарушения''';
    END IF;
  END IF;

  -- Добавляем поле в таблицу event_punishments (для событий)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_punishments') THEN
    ALTER TABLE event_punishments
    ADD COLUMN IF NOT EXISTS detained_persons_count INTEGER;

    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'event_punishments' AND column_name = 'detained_persons_count') THEN
      EXECUTE 'COMMENT ON COLUMN event_punishments.detained_persons_count IS ''Задержаны лица при совершении правонарушения''';
    END IF;
  END IF;
END $$;
