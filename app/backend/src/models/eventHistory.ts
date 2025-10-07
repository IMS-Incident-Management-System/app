import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import EventType, { EventTypeAttributes } from './eventType';
import Incident, { IncidentAttributes } from './incident';

export interface EventHistoryAttributes {
  id: number;
  incident_id: number;
  event_type_id: number;
  sub_type_id?: number;
  description?: string;
  date: Date;
  entry_date?: Date;             // Дата внесения инцидента
  // Поля адреса
  city?: string;
  street?: string;
  house?: string;
  building?: string;
  // apartment удалён
  number?: string; // Номер (помещения/объекта/другой номер)
  // Поля персональных данных
  last_name?: string;           // Фамилия
  first_name?: string;          // Имя
  middle_name?: string;         // Отчество
  employee_number?: string;     // Табельный номер
}

export interface EventHistoryWithRelations extends EventHistoryAttributes {
  event_type?: EventTypeAttributes;
  incident?: IncidentAttributes;
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
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Город'
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Улица'
  },
  house: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Дом'
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Корпус'
  },
  // apartment удалён
  number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Номер'
  },
  // Поля персональных данных
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
  employee_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Табельный номер'
  },
  sub_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID подтипа события (тип кражи, тип пожара и т.д.)'
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  entry_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Дата внесения инцидента'
  },
}, {
  tableName: 'event_history'
});

export default EventHistory;