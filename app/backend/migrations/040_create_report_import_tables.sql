-- Архивные Excel-отчёты: батчи импорта и нормализованные факты

CREATE TABLE IF NOT EXISTS report_import_batches (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(64) NOT NULL DEFAULT 'rp053_matrix',
    file_name VARCHAR(512) NOT NULL,
    storage_path VARCHAR(1024),
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    replaced_by_batch_id INTEGER,
    uploaded_by VARCHAR(255),
    validation_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE report_import_batches
      ADD CONSTRAINT fk_report_import_batches_replaced_by
      FOREIGN KEY (replaced_by_batch_id)
      REFERENCES report_import_batches(id)
      ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END
$$;

CREATE INDEX IF NOT EXISTS idx_report_import_batches_active
  ON report_import_batches (report_type, period_from, period_to, status);

CREATE INDEX IF NOT EXISTS idx_report_import_batches_period
  ON report_import_batches (period_from, period_to);

COMMENT ON TABLE report_import_batches IS 'Партии импорта архивных Excel-отчётов';
COMMENT ON COLUMN report_import_batches.report_type IS 'Тип отчёта (rp053_matrix и др.)';
COMMENT ON COLUMN report_import_batches.status IS 'pending | active | superseded | failed';
COMMENT ON COLUMN report_import_batches.replaced_by_batch_id IS 'Батч, который заменил этот (при supersede)';

CREATE TABLE IF NOT EXISTS report_facts (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL,
    metric_key VARCHAR(128) NOT NULL,
    department_id INTEGER NOT NULL,
    value DOUBLE PRECISION NOT NULL DEFAULT 0,
    excel_address VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_report_facts_batch_metric_dept UNIQUE (batch_id, metric_key, department_id)
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE report_facts
      ADD CONSTRAINT fk_report_facts_batch
      FOREIGN KEY (batch_id)
      REFERENCES report_import_batches(id)
      ON DELETE CASCADE;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'departments'
  ) THEN
    BEGIN
      ALTER TABLE report_facts
        ADD CONSTRAINT fk_report_facts_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_report_facts_batch ON report_facts (batch_id);
CREATE INDEX IF NOT EXISTS idx_report_facts_metric ON report_facts (metric_key);

COMMENT ON TABLE report_facts IS 'Нормализованные ячейки архивного отчёта (не доменные сущности)';
COMMENT ON COLUMN report_facts.metric_key IS 'Семантический ключ показателя (REPORT_FIELDS.metricKey)';
COMMENT ON COLUMN report_facts.excel_address IS 'Адрес исходной ячейки, например F17';

-- Право импорта отчётов для роли Администратор
INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'report.import'
FROM roles r
WHERE r.code = 'administrator'
ON CONFLICT (role_id, permission) DO NOTHING;
