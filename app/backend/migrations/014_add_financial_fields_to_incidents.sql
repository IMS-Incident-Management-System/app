-- Миграция: Добавление финансовых полей в таблицы incidents и additionally
-- Дата: 2025-12-18
-- Описание: Добавляем поля для учета финансового ущерба и связанных показателей

-- Добавление финансовых полей в таблицу incidents
ALTER TABLE IF EXISTS incidents
  ADD COLUMN IF NOT EXISTS detected_damage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recovered_damage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prevented_damage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_income INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reduced_cost INTEGER DEFAULT 0;

COMMENT ON COLUMN incidents.detected_damage IS 'Выявлен ущерб (руб.)';
COMMENT ON COLUMN incidents.recovered_damage IS 'Возмещен ущерб (руб.)';
COMMENT ON COLUMN incidents.prevented_damage IS 'Предотвращен ущерб (руб.)';
COMMENT ON COLUMN incidents.additional_income IS 'Получен дополнительный доход (руб.)';
COMMENT ON COLUMN incidents.reduced_cost IS 'Снижена стоимость товаров, работ и услуг на сумму (руб.)';

-- Добавление недостающих финансовых полей в таблицу additionally
ALTER TABLE IF EXISTS additionally
  ADD COLUMN IF NOT EXISTS additional_income INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reduced_cost INTEGER DEFAULT 0;

COMMENT ON COLUMN additionally.additional_income IS 'Получен дополнительный доход (руб.)';
COMMENT ON COLUMN additionally.reduced_cost IS 'Снижена стоимость товаров, работ и услуг на сумму (руб.)';


