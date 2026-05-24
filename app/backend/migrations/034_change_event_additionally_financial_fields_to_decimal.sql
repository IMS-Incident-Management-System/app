-- Миграция: изменение денежных полей event_additionally на NUMERIC(15,2)
-- Описание: разрешаем хранить суммы с копейками для дополнений к событиям

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_additionally') THEN
    ALTER TABLE event_additionally
      ALTER COLUMN detected_damage TYPE NUMERIC(15,2) USING detected_damage::NUMERIC(15,2),
      ALTER COLUMN prevented_damage TYPE NUMERIC(15,2) USING prevented_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_damage TYPE NUMERIC(15,2) USING recovered_damage::NUMERIC(15,2),
      ALTER COLUMN additional_income TYPE NUMERIC(15,2) USING additional_income::NUMERIC(15,2),
      ALTER COLUMN reduced_cost TYPE NUMERIC(15,2) USING reduced_cost::NUMERIC(15,2);
  END IF;
END $$;

