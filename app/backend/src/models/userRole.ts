import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize';

export interface UserRoleAttributes {
  external_id: string;
  role_id: number;
}

class UserRole extends Model<UserRoleAttributes> implements UserRoleAttributes {
  public external_id!: string;
  public role_id!: number;
}

UserRole.init(
  {
    external_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    modelName: 'UserRole',
    timestamps: false,
  }
);

export default UserRole;
