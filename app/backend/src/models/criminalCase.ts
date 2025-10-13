import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface CriminalCaseAttributes {
  id: number;
  additionally_id: number;
  
  // Данные о передаче материалов
  transfer_date?: Date; // Дата передачи материалов в ПРоО
  document_number?: string; // Номер вх./исх. документа или Номер КУСП
  department_name?: string; // Наименование подразделения, куда переданы материалы
  
  // Результаты рассмотрения
  review_result?: string; // Результат рассмотрения материалов
  rejection_date?: Date; // Дата отказа в ВУД/ВАД
  rejection_reason?: string; // Причина отказа в ВУД/ВАД
  appeal_date?: Date; // Дата обжалования отказа в ВУД/ВАД
  
  // Данные уголовного/административного дела
  case_date?: Date; // Дата ВУД/ВАД
  case_number?: string; // Номер УД/АД
  law_article?: string; // Статья УКРФ/КоАПРФ
  initiator?: string; // Инициатор возбуждения УД/АД
  subject?: string; // Субъект преступления УД/АД
  detained_count?: number; // Задержано, чел.
  
  // Данные о привлекаемом лице
  person_name?: string; // ФИО лица (название юр.лица), привлекаемого к УО/АО
  
  // Результаты рассмотрения дела
  case_result?: string; // Результат рассмотрения УД/АД
  court_decision?: string; // Решение (приговор) суда
  convicted_count?: number; // Осуждено, чел.
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CriminalCaseCreationAttributes extends Optional<CriminalCaseAttributes, 'id'> {}

export interface CriminalCaseInstance 
  extends Model<CriminalCaseAttributes, CriminalCaseCreationAttributes>,
    CriminalCaseAttributes {}

const CriminalCase = sequelize.define<CriminalCaseInstance>('criminal_case', {
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
  
  // Данные о передаче материалов
  transfer_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата передачи материалов в ПРоО'
  },
  document_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Номер вх./исх. документа или Номер КУСП'
  },
  department_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Наименование подразделения, куда переданы материалы'
  },
  
  // Результаты рассмотрения
  review_result: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Результат рассмотрения материалов'
  },
  rejection_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата отказа в ВУД/ВАД'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Причина отказа в ВУД/ВАД'
  },
  appeal_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата обжалования отказа в ВУД/ВАД'
  },
  
  // Данные уголовного/административного дела
  case_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата ВУД/ВАД'
  },
  case_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Номер УД/АД'
  },
  law_article: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Статья УКРФ/КоАПРФ'
  },
  initiator: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Инициатор возбуждения УД/АД'
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Субъект преступления УД/АД'
  },
  detained_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Задержано, чел.'
  },
  
  // Данные о привлекаемом лице
  person_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ФИО лица (название юр.лица), привлекаемого к УО/АО'
  },
  
  // Результаты рассмотрения дела
  case_result: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Результат рассмотрения УД/АД'
  },
  court_decision: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Решение (приговор) суда'
  },
  convicted_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Осуждено, чел.'
  },
}, {
  tableName: 'criminal_cases',
  timestamps: true,
});

export default CriminalCase;

