import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface DamagesAttributes {
  id: number;
  object: string;
  damage_type: string;
  damage_amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DamagesCreationAttributes extends Optional<DamagesAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Damages extends Model<DamagesAttributes, DamagesCreationAttributes> implements DamagesAttributes {
  public id!: number;
  public object!: string;
  public damage_type!: string;
  public damage_amount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Damages.init(
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
    damage_type: {
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
    tableName: 'damages',
    timestamps: true,
  }
);

export default Damages;