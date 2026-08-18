import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';
import { IncidentEventWithRelations } from './incidentEvent';
import { AdditionallyAttributes } from './additionally';
import { IncidentAddressAttributes } from './incidentAddress';
import { IncidentPersonAttributes } from './incidentPerson';

export enum SecurityDirectionEnum {
  INFORMATION = 'INFORMATION', // ИБ
  ECONOMIC = 'ECONOMIC', // ЭБ
  SECURITY = 'SECURITY', // БПиО
  CYBER = 'CYBER', // КБ
  ANTIFRAUD = 'ANTIFRAUD', // Антифрод
  SORM = 'SORM', // СОРМ
}


export interface IncidentAttributes {
  id: number;
  code?: string; // Уникальный код инцидента (формат: IN-DDMMYYYY-HHmmss)
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  is_db: boolean;
  is_sent_1db: boolean;
  description?: string;
  source_last_name?: string;
  source_first_name?: string;
  source_middle_name?: string;
  source_position?: string;
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
  created_by?: string;
  updated_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IncidentWithRelations extends IncidentAttributes {
  department?: DepartmentModelType;
  object_type?: any; // ObjectType (для обратной совместимости)
  object_types?: any[]; // ObjectType[] (массив типов объектов)
  events?: IncidentEventWithRelations[];
  additionally?: AdditionallyAttributes[];
  addresses?: IncidentAddressAttributes[];
  persons?: IncidentPersonAttributes[];
}

export interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'is_sent_1db'> {}

export interface IncidentInstance
  extends Model<IncidentAttributes, IncidentCreationAttributes>,
    IncidentWithRelations {}

const Incident = sequelize.define<IncidentInstance>(
  'incidents',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Уникальный код инцидента (формат: IN-DDMMYYYY-HHmmss)'
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'department_id',
      },
      comment: 'Подразделение, работающее над инцидентом',
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: SecurityDirectionEnum.SECURITY,
      validate: {
        isIn: [Object.values(SecurityDirectionEnum)],
      },
      comment: 'Направление безопасности (ИБ/ЭБ/БПиО)',
    },
    object_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'object_types',
        key: 'object_type_id',
      },
      comment: 'Тип объекта',
    },
    is_db: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг "Особо важно". Указывает на особый статус инцидента, требующий специальной обработки'
    },
    is_sent_1db: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг "Отправлено 1ДБ"',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание инцидента'
    },
    source_last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Фамилия источника информации'
    },
    source_first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Имя источника информации'
    },
    source_middle_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Отчество источника информации'
    },
    source_position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Должность источника информации'
    },
    detected_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Выявлен ущерб (руб.)'
    },
    recovered_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещен ущерб (руб.)'
    },
    prevented_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращен ущерб (руб.)'
    },
    additional_income: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Получен дополнительный доход (руб.)'
    },
    reduced_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)'
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Keycloak sub создателя',
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Keycloak sub последнего редактора',
    },
  },
  {
    timestamps: true,
    tableName: 'incidents',
  }
);

export default Incident;
