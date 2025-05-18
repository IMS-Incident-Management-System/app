import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface UavsAttributes {
  id: number;
  object: string;
  uav_type: string;
  circumstances: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UavsCreationAttributes extends Optional<UavsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Uavs extends Model<UavsAttributes, UavsCreationAttributes> implements UavsAttributes {
  public id!: number;
  public object!: string;
  public uav_type!: string;
  public circumstances!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Uavs.init(
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
    uav_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    circumstances: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'uavs',
    timestamps: true,
  }
);

export default Uavs;