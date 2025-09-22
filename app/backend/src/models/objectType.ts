import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface ObjectTypeAttributes {
  object_type_id: number;
  title: string;
  parent_id?: number | null;
}

export interface ObjectTypeCreationAttributes
  extends Optional<ObjectTypeAttributes, 'object_type_id'> {}

export interface ObjectTypeInstance
  extends Model<ObjectTypeAttributes, ObjectTypeCreationAttributes>,
    ObjectTypeAttributes {}

const ObjectTypeModel = sequelize.define<ObjectTypeInstance>(
  'object_types',
  {
    object_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название типа объекта',
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'object_types',
        key: 'object_type_id',
      },
      comment: 'ID родительского типа объекта',
    },
  },
  {
    timestamps: true,
    tableName: 'object_types',
  }
);

// Связи
ObjectTypeModel.belongsTo(ObjectTypeModel, { as: 'parent', foreignKey: 'parent_id' });
ObjectTypeModel.hasMany(ObjectTypeModel, { as: 'children', foreignKey: 'parent_id' });

export default ObjectTypeModel;

