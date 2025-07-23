import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { EventHistoryAttributes } from './eventHistory';

// Базовые атрибуты
export interface CriminalCaseAttributes {
  id: number;
  event_history_id: number;      // Теперь только связь с событием
  
  // Данные о передаче материалов
  transfer_date?: Date;              // Дата передачи материалов в ПРоО
  document_number?: string;          // Номер вх./исх. документа или Номер КУСП
  department_name?: string;          // Наименование подразделения, куда переданы материалы
  
  // Результаты рассмотрения
  review_result?: string;            // Результат рассмотрения материалов
  rejection_date?: Date;             // Дата отказа в ВУД/ВАД
  rejection_reason?: string;         // Причина отказа в ВУД/ВАД
  appeal_date?: Date;               // Дата обжалования отказа в ВУД/ВАД
  
  // Данные уголовного/административного дела
  case_date?: Date;                 // Дата ВУД/ВАД
  case_number?: string;             // Номер УД/АД
  law_article?: string;             // Статья УКРФ/КоАПРФ
  initiator?: string;               // Инициатор возбуждения УД/АД
  subject?: string;                 // Субъект преступления УД/АД
  detained_count?: number;          // Задержано, чел.
  
  // Данные о привлекаемом лице
  person_name?: string;             // ФИО лица (название юр.лица), привлекаемого к УО/АО
  
  // Результаты рассмотрения дела
  case_result?: string;             // Результат рассмотрения УД/АД
  court_decision?: string;          // Решение (приговор) суда
  convicted_count?: number;         // Осуждено, чел.
}

export type CriminalCaseCreationAttributes = Optional<CriminalCaseAttributes, 'id'>;

export interface CriminalCaseWithRelations extends CriminalCaseAttributes {
  event?: EventHistoryAttributes;
}

// Интерфейс для экземпляра модели
export interface CriminalCaseInstance 
  extends Model<CriminalCaseAttributes, CriminalCaseCreationAttributes>,
    CriminalCaseWithRelations {}

const CriminalCase = sequelize.define<CriminalCaseInstance>(
  'criminal_cases',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_history_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'event_history',
        key: 'id'
      }
    },
    transfer_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    document_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    review_result: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rejection_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appeal_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    case_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    case_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    law_article: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    initiator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    detained_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    person_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    case_result: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    court_decision: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    convicted_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    }
  },
  {
    timestamps: true,
    tableName: 'criminal_cases'
  }
);

export default CriminalCase; 