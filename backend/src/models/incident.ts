import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize';
import DepartmentModel from './department';

export interface IncidentModelType {
  incident_id?: number;
  department_id: number;
}

const IncidentModel = sequelize.define<
  Model<IncidentModelType>,
  IncidentModelType
>('incidents', {
  incident_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DepartmentModel,
      key: 'department_id',
    },
  },
});

// Определяем связь с департаментом
IncidentModel.belongsTo(DepartmentModel, {
  foreignKey: 'department_id',
  as: 'department',
});

export default IncidentModel;
