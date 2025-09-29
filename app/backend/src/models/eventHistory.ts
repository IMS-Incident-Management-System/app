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
  sub_type_id?: number;
  description?: string;
  date: Date;
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
  // Множественные группы
  addresses?: any; // JSONB массив адресов
  persons?: any;   // JSONB массив персональных данных
  // Источник
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  // Поля ущерба
  detected_damage: number;      // Выявленный ущерб
  prevented_damage: number;     // Предотвращенный ущерб
  recovered_damage: number;     // Возмещенный ущерб
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
  // JSONB поля для множественных групп
  addresses: {
    type: (DataTypes as any).JSONB || DataTypes.JSON,
    allowNull: true,
    comment: 'Список адресов события'
  },
  persons: {
    type: (DataTypes as any).JSONB || DataTypes.JSON,
    allowNull: true,
    comment: 'Список персональных данных по событию'
  },
  // Источник
  source_last_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Источник: Фамилия'
  },
  source_first_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Источник: Имя'
  },
  source_middle_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Источник: Отчество'
  },
  source_position: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Источник: Должность'
  },
  sub_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID подтипа события (тип кражи, тип пожара и т.д.)'
  },
  detected_damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Выявленный ущерб'
  },
  prevented_damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Предотвращенный ущерб'
  },
  recovered_damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Возмещенный ущерб'
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