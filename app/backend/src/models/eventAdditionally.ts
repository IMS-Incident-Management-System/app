import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { EventAttributes } from './event';
import { EventCriminalCaseAttributes } from './eventCriminalCase';
import { EventPunishmentAttributes } from './eventPunishment';
import { EventAdditionallyPersonAttributes } from './eventAdditionallyPerson';

export interface EventAdditionallyAttributes {
  id: number;
  event_id: number;
  incident_date?: Date; // Дата происшествия
  addition_date?: Date; // Дата внесения дополнения к событию
  text_field?: string; // Текстовое поле
  detected_damage?: number; // Выявленный ущерб
  prevented_damage?: number; // Предотвращенный ущерб
  recovered_damage?: number; // Возмещенный ущерб
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
}

export interface EventAdditionallyWithRelations extends EventAdditionallyAttributes {
  event?: EventAttributes;
  criminal_case?: EventCriminalCaseAttributes;
  punishment?: EventPunishmentAttributes;
  persons?: EventAdditionallyPersonAttributes[];
}

export interface EventAdditionallyCreationAttributes extends Optional<EventAdditionallyAttributes, 'id'> {}

export interface EventAdditionallyInstance 
  extends Model<EventAdditionallyAttributes, EventAdditionallyCreationAttributes>,
    EventAdditionallyWithRelations {}

const EventAdditionally = sequelize.define<EventAdditionallyInstance>('event_additionally', {
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
    comment: 'ID события'
  },
  incident_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата происшествия'
  },
  addition_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата внесения дополнения к событию'
  },
  text_field: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Текстовое поле'
  },
  detected_damage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Выявленный ущерб'
  },
  prevented_damage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Предотвращенный ущерб'
  },
  recovered_damage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Возмещенный ущерб'
  },
  additional_income: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Получен дополнительный доход (руб.)'
  },
  reduced_cost: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)'
  },
}, {
  timestamps: true,
  tableName: 'event_additionally'
});

export default EventAdditionally;

