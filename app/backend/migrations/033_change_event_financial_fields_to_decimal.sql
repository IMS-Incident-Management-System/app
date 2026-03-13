-- Миграция: изменение денежных полей событий на NUMERIC(15,2)
-- Описание: разрешаем хранить суммы с копейками для событий

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE events
      ALTER COLUMN detected_damage TYPE NUMERIC(15,2) USING detected_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_damage TYPE NUMERIC(15,2) USING recovered_damage::NUMERIC(15,2),
      ALTER COLUMN prevented_damage TYPE NUMERIC(15,2) USING prevented_damage::NUMERIC(15,2),
      ALTER COLUMN additional_income TYPE NUMERIC(15,2) USING additional_income::NUMERIC(15,2),
      ALTER COLUMN reduced_cost TYPE NUMERIC(15,2) USING reduced_cost::NUMERIC(15,2),
      ALTER COLUMN prevented_unnecessary_writeoff TYPE NUMERIC(15,2) USING prevented_unnecessary_writeoff::NUMERIC(15,2),
      ALTER COLUMN vat_deducted TYPE NUMERIC(15,2) USING vat_deducted::NUMERIC(15,2);
  END IF;
END $$;

