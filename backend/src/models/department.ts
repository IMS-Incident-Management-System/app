import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize';
import { IModel } from '../interfaces/common';

export interface DepartmentModelType {
  department_id: number;
  name: string;
  type: 'KTS' | 'FO' | 'DZK' | 'ETSKB'; // КЦ, ФО, ДЗК, ЕЦКБ
  parent_id: number | null;
  region_type?: string; // For FO subdivisions
}

const DepartmentModel = sequelize.define<IModel<DepartmentModelType>, DepartmentModelType>(
  'departments',
  {
    department_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'department_id',
      }
    },
    region_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }
);

DepartmentModel.belongsTo(DepartmentModel, { as: 'parent', foreignKey: 'parent_id' });
DepartmentModel.hasMany(DepartmentModel, { as: 'children', foreignKey: 'parent_id' });

export default DepartmentModel;
