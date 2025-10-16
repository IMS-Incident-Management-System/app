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

-- Результаты рассмотрения дела
ALTER TABLE IF EXISTS criminal_cases
  ADD COLUMN IF NOT EXISTS case_result TEXT,
  ADD COLUMN IF NOT EXISTS court_decision TEXT,
  ADD COLUMN IF NOT EXISTS convicted_count INTEGER;

-- Комментарии для новых колонок
COMMENT ON COLUMN criminal_cases.rejection_date IS 'Дата отказа в ВУД/ВАД';
COMMENT ON COLUMN criminal_cases.rejection_reason IS 'Причина отказа в ВУД/ВАД';
COMMENT ON COLUMN criminal_cases.appeal_date IS 'Дата обжалования отказа в ВУД/ВАД';
COMMENT ON COLUMN criminal_cases.case_date IS 'Дата ВУД/ВАД';
COMMENT ON COLUMN criminal_cases.initiator IS 'Инициатор возбуждения УД/АД';
COMMENT ON COLUMN criminal_cases.subject IS 'Субъект преступления УД/АД';
COMMENT ON COLUMN criminal_cases.detained_count IS 'Задержано, чел.';
COMMENT ON COLUMN criminal_cases.case_result IS 'Результат рассмотрения УД/АД';
COMMENT ON COLUMN criminal_cases.court_decision IS 'Решение (приговор) суда';
COMMENT ON COLUMN criminal_cases.convicted_count IS 'Осуждено, чел.';

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

-- Комментарии для колонок punishments
COMMENT ON COLUMN punishments.guilty_persons_count IS 'Установлено виновных лиц – кол-во';
COMMENT ON COLUMN punishments.measures_taken_count IS 'Принято мер к виновным лицам – кол-во';
COMMENT ON COLUMN punishments.warning_letter_rp398 IS 'Предупреждение предупредительным письмом по РП-398';
COMMENT ON COLUMN punishments.remark IS 'Замечание';
COMMENT ON COLUMN punishments.reprimand IS 'Выговор';
COMMENT ON COLUMN punishments.dismissed_count IS 'Уволено – кол-во';

-- 3) Индексы и внешние ключи уже существуют с 001/002; дополнительно убеждаемся, что FK корректен
ALTER TABLE IF EXISTS criminal_cases
  ADD CONSTRAINT IF NOT EXISTS criminal_cases_additionally_id_fkey
  FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS punishments
  ADD CONSTRAINT IF NOT EXISTS punishments_additionally_id_fkey
  FOREIGN KEY (additionally_id) REFERENCES additionally(id) ON DELETE CASCADE;


