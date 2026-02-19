-- Создание таблицы пояснительных записок
CREATE TABLE IF NOT EXISTS explanatory_notes (
    id SERIAL PRIMARY KEY,
    number INTEGER,
    kc_r VARCHAR(50),
    p VARCHAR(10),
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    entry_date DATE NOT NULL,
    event_info TEXT,
    service_investigation_count INTEGER DEFAULT 0,
    service_check_ib_count INTEGER DEFAULT 0,
    verification_activity_count INTEGER DEFAULT 0,
    punished_count INTEGER DEFAULT 0,
    dismissed_count INTEGER DEFAULT 0,
    materials_transferred_count INTEGER DEFAULT 0,
    cases_initiated_count INTEGER DEFAULT 0,
    detected_damage INTEGER DEFAULT 0,
    recovered_damage INTEGER DEFAULT 0,
    recovered_receivables INTEGER DEFAULT 0,
    prevented_damage INTEGER DEFAULT 0,
    reduced_cost INTEGER DEFAULT 0,
    prevented_writeoff_receivables INTEGER DEFAULT 0,
    additional_income INTEGER DEFAULT 0,
    vat_deducted INTEGER DEFAULT 0,
    department_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем внешний ключ на departments, только если таблица departments существует
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'departments'
  ) THEN
    BEGIN
      ALTER TABLE explanatory_notes
        ADD CONSTRAINT fk_explanatory_note_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_object THEN
        -- Ограничение уже существует – ничего не делаем
        NULL;
    END;
  END IF;
END
$$;

COMMENT ON TABLE explanatory_notes IS 'Пояснительная записка к отчету по форме 2-ДБ по Группе МТС';
COMMENT ON COLUMN explanatory_notes.number IS '№';
COMMENT ON COLUMN explanatory_notes.kc_r IS 'КЦ/Р';
COMMENT ON COLUMN explanatory_notes.p IS 'P';
COMMENT ON COLUMN explanatory_notes.period_from IS 'Период (начало)';
COMMENT ON COLUMN explanatory_notes.period_to IS 'Период (конец)';
COMMENT ON COLUMN explanatory_notes.entry_date IS 'Дата занесения';
COMMENT ON COLUMN explanatory_notes.event_info IS 'Информация о событии';
COMMENT ON COLUMN explanatory_notes.service_investigation_count IS 'Кол-во СП СР';
COMMENT ON COLUMN explanatory_notes.service_check_ib_count IS 'Кол-во СП ИБ';
COMMENT ON COLUMN explanatory_notes.verification_activity_count IS 'Кол-во ПМ';
COMMENT ON COLUMN explanatory_notes.punished_count IS 'Кол-во наказано';
COMMENT ON COLUMN explanatory_notes.dismissed_count IS 'Кол-во уволено';
COMMENT ON COLUMN explanatory_notes.materials_transferred_count IS 'Кол-во передано материалов';
COMMENT ON COLUMN explanatory_notes.cases_initiated_count IS 'Кол-во возбуждено УД/АД';
COMMENT ON COLUMN explanatory_notes.detected_damage IS 'Выявлен ущерб, руб.';
COMMENT ON COLUMN explanatory_notes.recovered_damage IS 'Возмещен ущерб, руб.';
COMMENT ON COLUMN explanatory_notes.recovered_receivables IS 'Возмещена ДЗ, руб.';
COMMENT ON COLUMN explanatory_notes.prevented_damage IS 'Предотвращен ущерб, руб.';
COMMENT ON COLUMN explanatory_notes.reduced_cost IS 'Снижена стоимость закупки, договора, доп.согл., руб.';
COMMENT ON COLUMN explanatory_notes.prevented_writeoff_receivables IS 'Предотвращен о необ. списание ДЗ, руб.';
COMMENT ON COLUMN explanatory_notes.additional_income IS 'Получен доп. доход, руб.';
COMMENT ON COLUMN explanatory_notes.vat_deducted IS 'Принят к вычету НДС, руб.';
COMMENT ON COLUMN explanatory_notes.department_id IS 'Подразделение';
