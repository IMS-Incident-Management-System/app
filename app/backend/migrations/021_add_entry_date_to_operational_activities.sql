-- Миграция для добавления поля entry_date (дата внесения) в таблицу operational_activities
-- Создана: 2024

-- Добавляем поле entry_date (дата внесения)
ALTER TABLE operational_activities
ADD COLUMN IF NOT EXISTS entry_date DATE;

COMMENT ON COLUMN operational_activities.entry_date IS 'Дата внесения операционной деятельности';

