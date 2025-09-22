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
  }
});

export default Punishment;