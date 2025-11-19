-- Миграция: Добавление полей для категории КБ (Кибербезопасность) в таблицу events
-- Дата: 2024-12-XX

-- Добавление полей для КБ - LAW_ENFORCEMENT (Взаимодействие с правоохранительными органами)
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS cyber_incoming_paper_requests INTEGER,
ADD COLUMN IF NOT EXISTS cyber_executed_paper_requests INTEGER,
ADD COLUMN IF NOT EXISTS cyber_executed_paper_tasks INTEGER,
ADD COLUMN IF NOT EXISTS cyber_received_presentations INTEGER,
ADD COLUMN IF NOT EXISTS cyber_executed_presentations INTEGER;

-- Комментарии к полям
COMMENT ON COLUMN events.cyber_incoming_paper_requests IS 'Поступило входящих бумажных запросов ПОО на предоставление информации';
COMMENT ON COLUMN events.cyber_executed_paper_requests IS 'Исполнено бумажных запросов ПОО на предоставление информации';
COMMENT ON COLUMN events.cyber_executed_paper_tasks IS 'Исполнено заданий в бумажных запросах ПОО на предоставление информации';
COMMENT ON COLUMN events.cyber_received_presentations IS 'Поступило представлений правоохранительных органов, прокуратуры и суда';
COMMENT ON COLUMN events.cyber_executed_presentations IS 'из них исполнено (подготовлен ответ)';

