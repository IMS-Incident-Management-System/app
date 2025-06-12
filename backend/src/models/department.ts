import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize';
import { IModel } from '../interfaces/common';
import { transliterate } from '../utils/strings';

export interface DepartmentModelType {
  department_id: number;
  title: string;
  value: string;
  parent_id: number | null;
}

const DepartmentModel = sequelize.define<IModel<DepartmentModelType>, DepartmentModelType>(
  'departments',
  {
    department_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'department_id',
      }
    },
  },
  {
    hooks: {
      beforeValidate: async (department: any) => {
        if (department.changed('title')) {
          let value = transliterate(department.title);
          
          // Если есть parent_id, добавляем префикс из названия родителя
          if (department.parent_id) {
            const parent = await DepartmentModel.findByPk(department.parent_id);
            if (parent) {
              const parentPrefix = transliterate(parent.title);
              value = `${parentPrefix}_${value}`.toLowerCase();
            }
          }
          
          department.value = value;
        }
      }
    }
  }
);

DepartmentModel.belongsTo(DepartmentModel, { as: 'parent', foreignKey: 'parent_id' });
DepartmentModel.hasMany(DepartmentModel, { as: 'children', foreignKey: 'parent_id' });

export default DepartmentModel;