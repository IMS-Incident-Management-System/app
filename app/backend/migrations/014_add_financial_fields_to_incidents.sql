-- Миграция: Добавление финансовых полей в таблицы incidents и additionally
-- Дата: 2025-12-18
-- Описание: Добавляем поля для учета финансового ущерба и связанных показателей

-- Добавление финансовых полей в таблицу incidents
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    ALTER TABLE incidents
      ADD COLUMN IF NOT EXISTS detected_damage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS recovered_damage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS prevented_damage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS additional_income INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reduced_cost INTEGER DEFAULT 0;

    -- Комментарии к колонкам incidents (только если колонки существуют)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'detected_damage') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.detected_damage IS ''Выявлен ущерб (руб.)''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'recovered_damage') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.recovered_damage IS ''Возмещен ущерб (руб.)''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'prevented_damage') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.prevented_damage IS ''Предотвращен ущерб (руб.)''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'additional_income') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.additional_income IS ''Получен дополнительный доход (руб.)''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'reduced_cost') THEN
      EXECUTE 'COMMENT ON COLUMN incidents.reduced_cost IS ''Снижена стоимость товаров, работ и услуг на сумму (руб.)''';
    END IF;
  END IF;
END $$;

-- Добавление недостающих финансовых полей в таблицу additionally
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    ALTER TABLE additionally
      ADD COLUMN IF NOT EXISTS additional_income INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reduced_cost INTEGER DEFAULT 0;

    -- Комментарии к колонкам additionally (только если колонки существуют)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'additionally' AND column_name = 'additional_income') THEN
      EXECUTE 'COMMENT ON COLUMN additionally.additional_income IS ''Получен дополнительный доход (руб.)''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'additionally' AND column_name = 'reduced_cost') THEN
      EXECUTE 'COMMENT ON COLUMN additionally.reduced_cost IS ''Снижена стоимость товаров, работ и услуг на сумму (руб.)''';
    END IF;
  END IF;
END $$;


