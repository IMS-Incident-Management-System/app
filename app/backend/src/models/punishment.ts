import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface PunishmentAttributes {
  id: number;
  additionally_id: number;
  guilty_persons_count?: number; // Установлено виновных лиц – кол-во
  measures_taken_count?: number; // Принято мер к виновным лицам – кол-во
  warning_letter_rp398?: number; // Предупреждение предупредительным письмом по РП-398
  remark?: number; // Замечание
  reprimand?: number; // Выговор
  dismissed_count?: number; // Уволено – кол-во
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
  guilty_persons_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Установлено виновных лиц – кол-во'
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
  tableName: 'punishments',
  timestamps: false,
});

export default Punishment;

