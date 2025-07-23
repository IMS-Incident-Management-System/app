import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { TheftTypeEnum } from '../../enums/theft';

export interface TheftTypeAttributes {
  id: number;
  type: TheftTypeEnum;
  name: string;
}

export interface TheftTypeCreationAttributes
  extends Optional<TheftTypeAttributes, 'id'> {}

// Интерфейс для экземпляра модели
export interface TheftTypeInstance
  extends Model<TheftTypeAttributes, TheftTypeCreationAttributes>,
    TheftTypeAttributes {}

const TheftType = sequelize.define<TheftTypeInstance>(
  'theft_types',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(TheftTypeEnum)],
      },
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'theft_types',
  }
);

export default TheftType;
