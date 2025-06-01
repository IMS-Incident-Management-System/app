import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { EEventType } from '../enums/eventTypes';

export interface EventTypeAttributes {
  id: number;
  name: string;
  type: EEventType;
}

export interface EventTypeCreationAttributes
  extends Optional<EventTypeAttributes, 'id'> {}

// Интерфейс для экземпляра модели
export interface EventTypeInstance
  extends Model<EventTypeAttributes, EventTypeCreationAttributes>,
    EventTypeAttributes {}

const EventType = sequelize.define<EventTypeInstance>('event_types', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    validate: {
      isIn: [Object.values(EEventType)],
    },
    allowNull: false,
    unique: true
  },
});

export default EventType;
