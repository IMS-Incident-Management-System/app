import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface ArsonAttributes {
  id: number;
  object: string;
  cause: string;
  damage_amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArsonCreationAttributes extends Optional<ArsonAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Arson extends Model<ArsonAttributes, ArsonCreationAttributes> implements ArsonAttributes {
  public id!: number;
  public object!: string;
  public cause!: string;
  public damage_amount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Arson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    object: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cause: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    damage_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'arson',
    timestamps: true,
  }
);

export default Arson;