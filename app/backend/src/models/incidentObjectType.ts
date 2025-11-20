import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface IncidentObjectTypeAttributes {
  id: number;
  incident_id: number;
  object_type_id: number;
}

export interface IncidentObjectTypeCreationAttributes
  extends Optional<IncidentObjectTypeAttributes, 'id'> {}

export interface IncidentObjectTypeInstance
  extends Model<IncidentObjectTypeAttributes, IncidentObjectTypeCreationAttributes>,
    IncidentObjectTypeAttributes {}

const IncidentObjectType = sequelize.define<IncidentObjectTypeInstance>(
  'incident_object_types',
  {
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
      comment: 'ID инцидента',
    },
    object_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'object_types',
        key: 'object_type_id',
      },
      onDelete: 'CASCADE',
      comment: 'ID типа объекта',
    },
  },
  {
    timestamps: false,
    tableName: 'incident_object_types',
    indexes: [
      {
        unique: true,
        fields: ['incident_id', 'object_type_id'],
        name: 'incident_object_type_unique',
      },
    ],
  }
);

export default IncidentObjectType;

