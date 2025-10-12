import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';

export interface CriminalCaseAttributes {
  id: number;
  additionally_id: number;
  transfer_date?: Date;
  document_number?: string;
  department_name?: string;
  review_result?: string;
  case_number?: string;
  law_article?: string;
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
  transfer_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата передачи'
  },
  document_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Номер документа'
  },
  department_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Наименование подразделения'
  },
  review_result: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Результат рассмотрения'
  },
  case_number: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Номер дела'
  },
  law_article: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Статья закона'
  },
}, {
  tableName: 'criminal_cases',
  timestamps: false,
});

export default CriminalCase;

