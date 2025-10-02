import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { IncidentAttributes } from './incident';

export interface PunishmentAttributes {
  id: number;
  incident_id: number;
  punishment_type_id: number;
  description?: string;
  fired_count: number;
  date: Date;
  // Расширенные счётчики (поддержка формата FE)
  guilty_persons_count?: number;
  punished_persons_count?: number;
  warnings_count?: number;
  reprimands_count?: number;
  severe_reprimands_count?: number;
}

export interface PunishmentWithRelations extends PunishmentAttributes {
  incident?: IncidentAttributes;
}

export type PunishmentCreationAttributes = Optional<PunishmentAttributes, 'id'>;

export interface PunishmentInstance 
  extends Model<PunishmentAttributes, PunishmentCreationAttributes>,
    PunishmentWithRelations {}

const Punishment = sequelize.define<PunishmentInstance>('punishments', {
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
  punishment_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID типа наказания'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Описание наказания'
  },
  fired_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Новые поля для поддержки фронтовых счётчиков
  guilty_persons_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  punished_persons_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  warnings_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  reprimands_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  severe_reprimands_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  }
});

export default Punishment;