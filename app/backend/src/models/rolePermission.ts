import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize';

export interface RolePermissionAttributes {
  role_id: number;
  permission: string;
}

class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
  public role_id!: number;
  public permission!: string;
}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
    },
    permission: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    modelName: 'RolePermission',
    timestamps: false,
  }
);

export default RolePermission;
