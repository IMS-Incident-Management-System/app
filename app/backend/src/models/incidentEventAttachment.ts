import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { IncidentEventAttributes } from './incidentEvent';

export interface IncidentEventAttachmentAttributes {
  id: number;
  incident_event_id: number;
  filename: string; // Оригинальное имя файла
  stored_filename: string; // Имя файла на диске
  file_path: string; // Путь к файлу
  file_size: number; // Размер файла в байтах
  mime_type: string; // MIME тип файла
}

export interface IncidentEventAttachmentWithRelations extends IncidentEventAttachmentAttributes {
  incident_event?: IncidentEventAttributes;
}

export interface IncidentEventAttachmentCreationAttributes extends Optional<IncidentEventAttachmentAttributes, 'id'> {}

export interface IncidentEventAttachmentInstance 
  extends Model<IncidentEventAttachmentAttributes, IncidentEventAttachmentCreationAttributes>,
    IncidentEventAttachmentWithRelations {}

const IncidentEventAttachment = sequelize.define<IncidentEventAttachmentInstance>('incident_event_attachments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  incident_event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'incident_events',
      key: 'id',
    },
    comment: 'ID дополнения инцидента (incident event)'
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
  tableName: 'incident_event_attachments',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default IncidentEventAttachment;

