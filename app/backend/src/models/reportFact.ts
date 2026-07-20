import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface ReportFactAttributes {
  id: number;
  batch_id: number;
  metric_key: string;
  department_id: number;
  value: number;
  excel_address?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportFactCreationAttributes
  extends Optional<ReportFactAttributes, 'id' | 'excel_address' | 'createdAt' | 'updatedAt'> {}

export interface ReportFactInstance
  extends Model<ReportFactAttributes, ReportFactCreationAttributes>,
    ReportFactAttributes {}

const ReportFact = sequelize.define<ReportFactInstance>(
  'report_facts',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metric_key: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    excel_address: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
  },
  {
    tableName: 'report_facts',
    timestamps: true,
    underscored: true,
  }
);

export default ReportFact;
