import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface TheftsAttributes {
  id: number;
  object: string;
  damage_amount: number;
  criminal_case: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TheftsCreationAttributes extends Optional<TheftsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Thefts extends Model<TheftsAttributes, TheftsCreationAttributes> implements TheftsAttributes {
  public id!: number;
  public object!: string;
  public damage_amount!: number;
  public criminal_case!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Thefts.init(
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
    damage_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    criminal_case: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'thefts',
    timestamps: true,
  }
);

export default Thefts;