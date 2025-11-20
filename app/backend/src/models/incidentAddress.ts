import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface IncidentAddressAttributes {
  id: number;
  incident_id: number;
  city?: string;
  street?: string;
  house?: string;
  building?: string;
  apartment?: string;
}

export interface IncidentAddressCreationAttributes extends Optional<IncidentAddressAttributes, 'id'> {}

export interface IncidentAddressInstance 
  extends Model<IncidentAddressAttributes, IncidentAddressCreationAttributes>,
    IncidentAddressAttributes {}

const IncidentAddress = sequelize.define<IncidentAddressInstance>('incident_address', {
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
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Город'
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Улица'
  },
  house: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Дом'
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Корпус'
  },
  apartment: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Квартира'
  },
}, {
  tableName: 'incident_addresses',
  timestamps: false,
});

export default IncidentAddress;

