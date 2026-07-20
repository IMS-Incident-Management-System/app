import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export type ReportImportBatchStatus = 'pending' | 'active' | 'superseded' | 'failed';

export const REPORT_TYPE_RP053_MATRIX = 'rp053_matrix';

export interface ReportImportBatchAttributes {
  id: number;
  report_type: string;
  file_name: string;
  storage_path?: string | null;
  period_from: Date;
  period_to: Date;
  status: ReportImportBatchStatus;
  replaced_by_batch_id?: number | null;
  uploaded_by?: string | null;
  validation_summary?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportImportBatchCreationAttributes
  extends Optional<
    ReportImportBatchAttributes,
    | 'id'
    | 'report_type'
    | 'storage_path'
    | 'status'
    | 'replaced_by_batch_id'
    | 'uploaded_by'
    | 'validation_summary'
    | 'createdAt'
    | 'updatedAt'
  > {}

export interface ReportImportBatchInstance
  extends Model<ReportImportBatchAttributes, ReportImportBatchCreationAttributes>,
    ReportImportBatchAttributes {}

const ReportImportBatch = sequelize.define<ReportImportBatchInstance>(
  'report_import_batches',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    report_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: REPORT_TYPE_RP053_MATRIX,
    },
    file_name: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    storage_path: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    period_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'pending',
    },
    replaced_by_batch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uploaded_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    validation_summary: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: 'report_import_batches',
    timestamps: true,
    underscored: true,
  }
);

export default ReportImportBatch;
