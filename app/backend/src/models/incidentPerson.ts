import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface IncidentPersonAttributes {
  id: number;
  incident_id: number;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  employee_number?: string;
  outcome_type?: 'injury' | 'fatal'; // Травма / Смертельный исход
}

export interface IncidentPersonCreationAttributes extends Optional<IncidentPersonAttributes, 'id'> {}

export interface IncidentPersonInstance 
  extends Model<IncidentPersonAttributes, IncidentPersonCreationAttributes>,
    IncidentPersonAttributes {}

const IncidentPerson = sequelize.define<IncidentPersonInstance>('incident_person', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'incidents',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Фамилия'
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Имя'
  },
  middle_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Отчество'
  },
  employee_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Табельный номер'
  },
  outcome_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Тип исхода: injury - Травма, fatal - Смертельный исход'
  },
}, {
  tableName: 'incident_persons',
  timestamps: false,
});

export default IncidentPerson;

