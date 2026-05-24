-- Миграция: изменение денежных полей на DECIMAL(15,2)
-- Описание: разрешаем хранить суммы с копейками

DO $$
BEGIN
  -- incidents: финансовые поля
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    ALTER TABLE incidents
      ALTER COLUMN detected_damage TYPE NUMERIC(15,2) USING detected_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_damage TYPE NUMERIC(15,2) USING recovered_damage::NUMERIC(15,2),
      ALTER COLUMN prevented_damage TYPE NUMERIC(15,2) USING prevented_damage::NUMERIC(15,2),
      ALTER COLUMN additional_income TYPE NUMERIC(15,2) USING additional_income::NUMERIC(15,2),
      ALTER COLUMN reduced_cost TYPE NUMERIC(15,2) USING reduced_cost::NUMERIC(15,2);
  END IF;

  -- additionally: финансовые поля
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    ALTER TABLE additionally
      ALTER COLUMN detected_damage TYPE NUMERIC(15,2) USING detected_damage::NUMERIC(15,2),
      ALTER COLUMN prevented_damage TYPE NUMERIC(15,2) USING prevented_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_damage TYPE NUMERIC(15,2) USING recovered_damage::NUMERIC(15,2),
      ALTER COLUMN additional_income TYPE NUMERIC(15,2) USING additional_income::NUMERIC(15,2),
      ALTER COLUMN reduced_cost TYPE NUMERIC(15,2) USING reduced_cost::NUMERIC(15,2);
  END IF;

  -- explanatory_notes: финансовые поля
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'explanatory_notes') THEN
    ALTER TABLE explanatory_notes
      ALTER COLUMN detected_damage TYPE NUMERIC(15,2) USING detected_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_damage TYPE NUMERIC(15,2) USING recovered_damage::NUMERIC(15,2),
      ALTER COLUMN recovered_receivables TYPE NUMERIC(15,2) USING recovered_receivables::NUMERIC(15,2),
      ALTER COLUMN prevented_damage TYPE NUMERIC(15,2) USING prevented_damage::NUMERIC(15,2),
      ALTER COLUMN reduced_cost TYPE NUMERIC(15,2) USING reduced_cost::NUMERIC(15,2),
      ALTER COLUMN prevented_writeoff_receivables TYPE NUMERIC(15,2) USING prevented_writeoff_receivables::NUMERIC(15,2),
      ALTER COLUMN additional_income TYPE NUMERIC(15,2) USING additional_income::NUMERIC(15,2),
      ALTER COLUMN vat_deducted TYPE NUMERIC(15,2) USING vat_deducted::NUMERIC(15,2);
  END IF;
END $$;

