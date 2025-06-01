import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { IncidentAttributes } from './incident';

export interface PunishmentAttributes {
  id: number;
  incident_id: number;
  guilty_persons_count: number;
  punished_persons_count: number;
  warnings_count: number;
  reprimands_count: number;
  severe_reprimands_count: number;
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
  guilty_persons_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  punished_persons_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  warnings_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reprimands_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  severe_reprimands_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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