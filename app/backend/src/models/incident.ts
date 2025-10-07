import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';
import { EventHistoryWithRelations } from './eventHistory';
import { AdditionallyAttributes } from './additionally';

export enum SecurityDirectionEnum {
  INFORMATION = 'INFORMATION', // ИБ
  ECONOMIC = 'ECONOMIC', // ЭБ
  SECURITY = 'SECURITY', // БПиО
}


export interface IncidentAttributes {
  id: number;
  department_id: number;
  direction: SecurityDirectionEnum;
  object_type_id?: number;
  is_db: boolean;
}

export interface IncidentWithRelations extends IncidentAttributes {
  department?: DepartmentModelType;
  object_type?: any; // ObjectType
  events?: EventHistoryWithRelations[];
  additionally?: AdditionallyAttributes[];
}

export interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id'> {}

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
      comment: 'Флаг "Дело безопасности" (ДБ). Указывает на особый статус инцидента, требующий специальной обработки'
    },
  },
  {
    timestamps: true,
    tableName: 'incidents',
  }
);

export default Incident;
