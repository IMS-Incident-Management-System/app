import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface EventAdditionallyPersonAttributes {
  id: number;
  event_additionally_id: number;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  birth_date?: Date;
  employee_number?: string;
}

export interface EventAdditionallyPersonCreationAttributes extends Optional<EventAdditionallyPersonAttributes, 'id'> {}

export interface EventAdditionallyPersonInstance 
  extends Model<EventAdditionallyPersonAttributes, EventAdditionallyPersonCreationAttributes>,
    EventAdditionallyPersonAttributes {}

const EventAdditionallyPerson = sequelize.define<EventAdditionallyPersonInstance>('event_additionally_person', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_additionally_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'event_additionally',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'ID дополнения к событию'
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Фамилия'
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Имя'
  },
  middle_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Отчество'
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Дата рождения'
  },
  employee_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Табельный номер'
  },
}, {
  tableName: 'event_additionally_persons',
  timestamps: false,
});

export default EventAdditionallyPerson;

