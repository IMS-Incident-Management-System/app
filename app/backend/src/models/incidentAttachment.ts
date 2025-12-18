import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { IncidentAttributes } from './incident';

export interface IncidentAttachmentAttributes {
  id: number;
  incident_id: number;
  filename: string; // Оригинальное имя файла
  stored_filename: string; // Имя файла на диске
  file_path: string; // Путь к файлу
  file_size: number; // Размер файла в байтах
  mime_type: string; // MIME тип файла
}

export interface IncidentAttachmentWithRelations extends IncidentAttachmentAttributes {
  incident?: IncidentAttributes;
}

export interface IncidentAttachmentCreationAttributes extends Optional<IncidentAttachmentAttributes, 'id'> {}

export interface IncidentAttachmentInstance 
  extends Model<IncidentAttachmentAttributes, IncidentAttachmentCreationAttributes>,
    IncidentAttachmentWithRelations {}

const IncidentAttachment = sequelize.define<IncidentAttachmentInstance>('incident_attachments', {
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
    comment: 'ID инцидента'
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Оригинальное имя файла'
  },
  stored_filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Имя файла на диске'
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Путь к файлу'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Размер файла в байтах'
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'MIME тип файла'
  },
}, {
  timestamps: true,
  tableName: 'incident_attachments',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default IncidentAttachment;

