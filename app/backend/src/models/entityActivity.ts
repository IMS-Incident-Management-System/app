import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import {
  ActivityCategory,
  ActivityImportance,
  ActivitySource,
  ActorType,
  EntityType,
} from '../enums/entityActivity';
import { ActivityType } from '../constants/activityTypes';

export interface EntityActivityAttributes {
  id: number;
  entity_type: EntityType;
  entity_id: number;
  activity_type: ActivityType;
  category: ActivityCategory;
  importance: ActivityImportance;
  actor_type: ActorType;
  actor_external_id: string | null;
  source: ActivitySource;
  occurred_at: Date;
  summary: string;
  metadata: Record<string, unknown> | null;
}

export type EntityActivityCreationAttributes = Optional<
  EntityActivityAttributes,
  'id' | 'occurred_at' | 'metadata' | 'actor_external_id'
>;

export interface EntityActivityInstance
  extends Model<EntityActivityAttributes, EntityActivityCreationAttributes>,
    EntityActivityAttributes {}

const EntityActivity = sequelize.define<EntityActivityInstance>(
  'entity_activity',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    entity_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activity_type: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    importance: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: ActivityImportance.NORMAL,
    },
    actor_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    actor_external_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: ActivitySource.UI,
    },
    occurred_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: 'entity_activity',
    timestamps: false,
  }
);

export default EntityActivity;
