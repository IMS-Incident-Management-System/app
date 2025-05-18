import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

interface EventTypeAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventTypeCreationAttributes extends Optional<EventTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class EventType extends Model<EventTypeAttributes, EventTypeCreationAttributes> implements EventTypeAttributes {
  public id!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

EventType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'event_types',
    timestamps: true,
  }
);

export default EventType;