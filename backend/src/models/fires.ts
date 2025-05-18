import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

interface FiresAttributes {
  id: number;
  object: string;
  cause: string;
  damage_amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FiresCreationAttributes extends Optional<FiresAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Fires extends Model<FiresAttributes, FiresCreationAttributes> implements FiresAttributes {
  public id!: number;
  public object!: string;
  public cause!: string;
  public damage_amount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Fires.init(
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
    tableName: 'fires',
    timestamps: true,
  }
);

export default Fires;