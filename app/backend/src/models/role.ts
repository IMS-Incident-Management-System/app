import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface RoleAttributes {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description'>;

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string | null;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    modelName: 'Role',
    timestamps: false,
  }
);

export default Role;
