-- Миграция: Флаг «Отправлено 1ДБ» у инцидента
-- Дата: 2026-03-18

ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS is_sent_1db BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN incidents.is_sent_1db IS 'Флаг «Отправлено 1ДБ». Отмечается на карточке просмотра инцидента';
