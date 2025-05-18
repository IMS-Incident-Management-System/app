import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface PunishmentsAttributes {
  id: number;
  full_name: string;
  position: string;
  punishment_type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PunishmentsCreationAttributes extends Optional<PunishmentsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Punishments extends Model<PunishmentsAttributes, PunishmentsCreationAttributes> implements PunishmentsAttributes {
  public id!: number;
  public full_name!: string;
  public position!: string;
  public punishment_type!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Punishments.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    punishment_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'punishments',
    timestamps: true,
  }
);

export default Punishments;