import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import EventType, { EventTypeAttributes } from './eventType';
import Incident, { IncidentAttributes } from './incident';
import { ObjectAttributes } from './object';
import { CriminalCaseAttributes } from './criminalCase';
import { TheftTypeAttributes } from './incidentEvents/theft';

export interface EventHistoryAttributes {
  id: number;
  incident_id: number;
  event_type_id: number;
  object_id: number;
  damage_amount: number;
  compensation_amount: number;
  sub_type_id?: number;
  description?: string;
  date: Date;
}

export interface EventHistoryWithRelations extends EventHistoryAttributes {
  event_type?: EventTypeAttributes;
  object?: ObjectAttributes;
  incident?: IncidentAttributes;
  criminal_cases?: CriminalCaseAttributes[];
  sub_type?: TheftTypeAttributes;
}

export interface EventHistoryCreationAttributes extends Optional<EventHistoryAttributes, 'id'> {}

export interface EventHistoryInstance 
  extends Model<EventHistoryWithRelations, EventHistoryCreationAttributes>,
    EventHistoryWithRelations {}

const EventHistory = sequelize.define<EventHistoryInstance>('event_history', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'incidents',
      key: 'id',
    }
  },
  event_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'event_types',
      key: 'event_type_id',
    }
  },
  object_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'objects',
      key: 'id',
    }
  },
  sub_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID подтипа события (тип кражи, тип пожара и т.д.)'
  },
  damage_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  compensation_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'event_history'
});

export default EventHistory;