import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

interface UserProfileAttributes {
  id: number;
  external_id: string; // sub из провайдера (Keycloak / МТС и т.п.)
  auth_provider: string | null;
  patronymic: string | null;
  personnel_number: string | null;
  photo_path: string | null;
  display_name: string | null;
  preferred_username: string | null;
}

type UserProfileCreationAttributes = Optional<UserProfileAttributes, 'id' | 'auth_provider' | 'patronymic' | 'personnel_number' | 'photo_path' | 'display_name' | 'preferred_username'>;

class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes {
  public id!: number;
  public external_id!: string;
  public auth_provider!: string | null;
  public patronymic!: string | null;
  public personnel_number!: string | null;
  public photo_path!: string | null;
  public display_name!: string | null;
  public preferred_username!: string | null;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    auth_provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    patronymic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    personnel_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    display_name: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    preferred_username: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_profiles',
    modelName: 'UserProfile',
    timestamps: false,
  }
);

export default UserProfile;


