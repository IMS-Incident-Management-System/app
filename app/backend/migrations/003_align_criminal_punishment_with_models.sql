-- Миграция: Приведение схем criminal_cases и punishments к актуальным моделям
-- Дата: 2025-10-16

-- 1) Таблица criminal_cases: добавляем недостающие поля и комментарии
-- Примечание: 001 и 002 миграции создавали базовую структуру без части полей модели

-- Даты и причины по отказам/обжалованию
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS appeal_date TIMESTAMP;

-- Поля по делу (даты/инициатор/субъект/кол-во задержанных)
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS case_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS initiator VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS detained_count INTEGER;

-- Данные о привлекаемом лице
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS person_name VARCHAR(255);

-- Результаты рассмотрения дела
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS case_result TEXT,
  ADD COLUMN IF NOT EXISTS court_decision TEXT,
  ADD COLUMN IF NOT EXISTS convicted_count INTEGER;

-- Добавляем timestamps если они отсутствуют
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Комментарии для новых колонок (только если таблицы и колонки существуют)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'criminal_cases') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'rejection_date') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.rejection_date IS ''Дата отказа в ВУД/ВАД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'rejection_reason') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.rejection_reason IS ''Причина отказа в ВУД/ВАД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'appeal_date') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.appeal_date IS ''Дата обжалования отказа в ВУД/ВАД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'case_date') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.case_date IS ''Дата ВУД/ВАД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'initiator') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.initiator IS ''Инициатор возбуждения УД/АД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'subject') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.subject IS ''Субъект преступления УД/АД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'detained_count') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.detained_count IS ''Задержано, чел.''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'person_name') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.person_name IS ''ФИО лица (название юр.лица), привлекаемого к УО/АО''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'case_result') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.case_result IS ''Результат рассмотрения УД/АД''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'court_decision') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.court_decision IS ''Решение (приговор) суда''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'criminal_cases' AND column_name = 'convicted_count') THEN
      EXECUTE 'COMMENT ON COLUMN criminal_cases.convicted_count IS ''Осуждено, чел.''';
    END IF;
  END IF;
END $$;

-- 2) Таблица punishments: приводим к актуальной модели (агрегированные поля, без старых полей)
-- Удаляем устаревшие поля, если ранее были созданы (из 001/002)
ALTER TABLE IF EXISTS punishments
  DROP COLUMN IF EXISTS punishment_type_id,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS date,
  DROP COLUMN IF EXISTS fired_count;

-- Добавляем агрегированные поля, соответствующие модели
ALTER TABLE IF EXISTS punishments
  ADD COLUMN IF NOT EXISTS guilty_persons_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS measures_taken_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warning_letter_rp398 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remark INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reprimand INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dismissed_count INTEGER DEFAULT 0;

-- Комментарии для колонок punishments (только если таблица и колонки существуют)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'punishments') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'guilty_persons_count') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.guilty_persons_count IS ''Установлено виновных лиц – кол-во''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'measures_taken_count') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.measures_taken_count IS ''Принято мер к виновным лицам – кол-во''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'warning_letter_rp398') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.warning_letter_rp398 IS ''Предупреждение предупредительным письмом по РП-398''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'remark') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.remark IS ''Замечание''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'reprimand') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.reprimand IS ''Выговор''';
    END IF;
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'punishments' AND column_name = 'dismissed_count') THEN
      EXECUTE 'COMMENT ON COLUMN punishments.dismissed_count IS ''Уволено – кол-во''';
    END IF;
  END IF;
END $$;

-- 3) Индексы и внешние ключи уже существуют с 001/002; дополнительно убеждаемся, что FK корректен
DO $$ 
BEGIN
  -- Проверяем существование таблицы additionally перед добавлением внешнего ключа
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'criminal_cases') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'criminal_cases_additionally_id_fkey'
      ) THEN
        ALTER TABLE criminal_cases
          ADD CONSTRAINT criminal_cases_additionally_id_fkey
          FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  -- Проверяем существование таблицы additionally перед добавлением внешнего ключа
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'additionally') THEN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'punishments') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'punishments_additionally_id_fkey'
      ) THEN
        ALTER TABLE punishments
          ADD CONSTRAINT punishments_additionally_id_fkey
          FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;


