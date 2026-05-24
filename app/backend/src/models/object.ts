import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { ObjectType } from '../enums/object';

export interface ObjectAttributes {
  id: number;
  type: ObjectType;
  number?: string;
  address?: string;
  personnel_full_name?: string;
  personnel_position?: string;
  personnel_employee_number?: string;
}

export interface ObjectCreationAttributes
  extends Optional<ObjectAttributes, 'id'> {}

// Интерфейс для экземпляра модели
export interface ObjectInstance
  extends Model<ObjectAttributes, ObjectCreationAttributes>,
    ObjectAttributes {}

// Переименуем модель, так как Object - зарезервированное имя
const ObjectModel = sequelize.define<ObjectInstance>(
  'objects',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(ObjectType)],
      },
      comment: 'БС, офис МТС, Категорированное помещение, Иное имущество, Персонал',
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '№ БС или № офиса',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Адрес объекта',
    },
    personnel_full_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ФИО сотрудника (для типа PERSONNEL)',
    },
    personnel_position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Должность сотрудника (для типа PERSONNEL)',
    },
    personnel_employee_number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Табельный номер сотрудника (для типа PERSONNEL)',
    },
  },
  {
    timestamps: true,
    validate: {
      objectTypeValidation() {
        // Проверка обязательных полей в зависимости от типа объекта
        if (this.type === ObjectType.BS || this.type === ObjectType.OFFICE_MTS) {
          if (!this.number || !this.address) {
            throw new Error(
              'Number and address are required for BS and OFFICE types'
            );
          }
        }
        if (this.type === ObjectType.CATEGORIZED_ROOM) {
          if (!this.address) {
            throw new Error('Address is required for CATEGORIZED_ROOM type');
          }
        }
        if (this.type === ObjectType.PERSONNEL) {
          if (
            !this.personnel_full_name ||
            !this.personnel_position ||
            !this.personnel_employee_number
          ) {
            throw new Error(
              'Full name, position and employee number are required for PERSONNEL type'
            );
          }
        }
      },
    },
  }
);

export default ObjectModel;
