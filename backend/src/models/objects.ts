import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

interface ObjectsAttributes {
  id: number;
  type: string;
  bs_number?: string | null;
  office_number?: string | null;
  address?: string | null;
  full_name?: string | null;
  position?: string | null;
  employee_id?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ObjectsCreationAttributes extends Optional<ObjectsAttributes, 'id' | 'bs_number' | 'office_number' | 'address' | 'full_name' | 'position' | 'employee_id' | 'createdAt' | 'updatedAt'> {}

export class Objects extends Model<ObjectsAttributes, ObjectsCreationAttributes> implements ObjectsAttributes {
  public id!: number;
  public type!: string;
  public bs_number!: string | null;
  public office_number!: string | null;
  public address!: string | null;
  public full_name!: string | null;
  public position!: string | null;
  public employee_id!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Objects.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bs_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    office_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'objects',
    timestamps: true,
  }
);

export default Objects;