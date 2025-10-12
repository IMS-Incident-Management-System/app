import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface PunishmentAttributes {
  id: number;
  additionally_id: number;
  punishment_type_id: number;
  description?: string;
  date: Date;
  fired_count: number;
}

export interface PunishmentCreationAttributes extends Optional<PunishmentAttributes, 'id'> {}

export interface PunishmentInstance 
  extends Model<PunishmentAttributes, PunishmentCreationAttributes>,
    PunishmentAttributes {}

const Punishment = sequelize.define<PunishmentInstance>('punishment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  additionally_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'additionally',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'ID дополнения к инциденту'
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Дата наказания'
  },
  fired_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Количество уволенных'
  },
}, {
  tableName: 'punishments',
  timestamps: false,
});

export default Punishment;

