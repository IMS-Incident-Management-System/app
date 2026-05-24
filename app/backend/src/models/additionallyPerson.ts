import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface AdditionallyPersonAttributes {
  id: number;
  additionally_id: number;
  last_name?: string;
  first_name?: string;
  middle_name?: string;
  birth_date?: Date;
  employee_number?: string;
}

export interface AdditionallyPersonCreationAttributes extends Optional<AdditionallyPersonAttributes, 'id'> {}

export interface AdditionallyPersonInstance 
  extends Model<AdditionallyPersonAttributes, AdditionallyPersonCreationAttributes>,
    AdditionallyPersonAttributes {}

const AdditionallyPerson = sequelize.define<AdditionallyPersonInstance>('additionally_person', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  additionally_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'additionally',
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'ID дополнения к инциденту'
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
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Дата рождения'
  },
  employee_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Табельный номер'
  },
}, {
  tableName: 'additionally_persons',
  timestamps: false,
});

export default AdditionallyPerson;

