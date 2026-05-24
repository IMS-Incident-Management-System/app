import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface EventPunishmentAttributes {
  id: number;
  event_id: number;
  guilty_persons_count?: number; // Установлено виновных лиц – кол-во
  employees_involved_count?: number; // Установлено сотрудников, причастных к инциденту
  detained_persons_count?: number; // Задержаны лица при совершении правонарушения
  measures_taken_count?: number; // Принято мер к виновным лицам – кол-во
  warning_letter_rp398?: number; // Предупреждение предупредительным письмом по РП-398
  remark?: number; // Замечание
  reprimand?: number; // Выговор
  dismissed_count?: number; // Уволено – кол-во
}

export interface EventPunishmentCreationAttributes extends Optional<EventPunishmentAttributes, 'id'> {}

export interface EventPunishmentInstance 
  extends Model<EventPunishmentAttributes, EventPunishmentCreationAttributes>,
    EventPunishmentAttributes {}

const EventPunishment = sequelize.define<EventPunishmentInstance>('event_punishment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'ID события'
  },
  guilty_persons_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Установлено виновных лиц – кол-во'
  },
  employees_involved_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Установлено сотрудников, причастных к инциденту'
  },
  detained_persons_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Задержаны лица при совершении правонарушения'
  },
  measures_taken_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Принято мер к виновным лицам – кол-во'
  },
  warning_letter_rp398: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Предупреждение предупредительным письмом по РП-398'
  },
  remark: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Замечание'
  },
  reprimand: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Выговор'
  },
  dismissed_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Уволено – кол-во'
  },
}, {
  tableName: 'event_punishments',
  timestamps: false,
});

export default EventPunishment;

