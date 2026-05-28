-- Meta columns for entity authorship + entity_activity feed

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

COMMENT ON COLUMN incidents.created_by IS 'Keycloak sub пользователя, создавшего инцидент';
COMMENT ON COLUMN incidents.updated_by IS 'Keycloak sub пользователя, последним изменившего инцидент';

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

COMMENT ON COLUMN events.created_by IS 'Keycloak sub пользователя, создавшего событие';
COMMENT ON COLUMN events.updated_by IS 'Keycloak sub пользователя, последним изменившего событие';

ALTER TABLE operational_activities
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

COMMENT ON COLUMN operational_activities.updated_by IS 'Keycloak sub пользователя, последним изменившего запись';

CREATE TABLE IF NOT EXISTS entity_activity (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(64) NOT NULL,
  entity_id INTEGER NOT NULL,
  activity_type VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  importance VARCHAR(16) NOT NULL DEFAULT 'normal',
  actor_type VARCHAR(32) NOT NULL,
  actor_external_id VARCHAR(255),
  source VARCHAR(32) NOT NULL DEFAULT 'ui',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  summary TEXT NOT NULL,
  metadata JSONB
);

COMMENT ON TABLE entity_activity IS 'Semantic activity feed (narrative history) for root entities';
COMMENT ON COLUMN entity_activity.entity_type IS 'incident | event | operational_activity';
COMMENT ON COLUMN entity_activity.activity_type IS 'Semantic type from application registry';
COMMENT ON COLUMN entity_activity.category IS 'lifecycle | attachment | relation';
COMMENT ON COLUMN entity_activity.importance IS 'low | normal | high';
COMMENT ON COLUMN entity_activity.source IS 'ui | api | import | integration | ai_agent | system';

CREATE INDEX IF NOT EXISTS idx_entity_activity_entity_occurred
  ON entity_activity (entity_type, entity_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_entity_activity_actor_occurred
  ON entity_activity (actor_external_id, occurred_at DESC)
  WHERE actor_external_id IS NOT NULL;
