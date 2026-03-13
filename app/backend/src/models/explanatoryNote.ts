import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';

export interface ExplanatoryNoteAttributes {
  id: number;
  number?: number; // №
  kc_r?: string; // КЦ/Р
  p?: string; // P
  period_from: Date; // Период (начало)
  period_to: Date; // Период (конец)
  entry_date: Date; // Дата занесения
  event_info?: string; // Информация о событии
  service_investigation_count?: number; // Кол-во СП СР
  service_check_ib_count?: number; // Кол-во СП ИБ
  verification_activity_count?: number; // Кол-во ПМ
  punished_count?: number; // Кол-во наказано
  dismissed_count?: number; // Кол-во уволено
  materials_transferred_count?: number; // Кол-во передано материалов
  cases_initiated_count?: number; // Кол-во возбуждено УД/АД
  detected_damage?: number; // Выявлен ущерб, руб.
  recovered_damage?: number; // Возмещен ущерб, руб.
  recovered_receivables?: number; // Возмещена ДЗ, руб.
  prevented_damage?: number; // Предотвращен ущерб, руб.
  reduced_cost?: number; // Снижена стоимость закупки, договора, доп.согл., руб.
  prevented_writeoff_receivables?: number; // Предотвращен о необ. списание ДЗ, руб.
  additional_income?: number; // Получен доп. доход, руб.
  vat_deducted?: number; // Принят к вычету НДС, руб.
  department_id?: number; // Подразделение
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExplanatoryNoteWithRelations extends ExplanatoryNoteAttributes {
  department?: DepartmentModelType;
}

export interface ExplanatoryNoteCreationAttributes extends Optional<ExplanatoryNoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ExplanatoryNoteInstance
  extends Model<ExplanatoryNoteAttributes, ExplanatoryNoteCreationAttributes>,
    ExplanatoryNoteWithRelations {}

const ExplanatoryNote = sequelize.define<ExplanatoryNoteInstance>(
  'explanatory_notes',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '№',
    },
    kc_r: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'КЦ/Р',
    },
    p: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'P',
    },
    period_from: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Период (начало)',
    },
    period_to: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Период (конец)',
    },
    entry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Дата занесения',
    },
    event_info: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Информация о событии',
    },
    service_investigation_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во СП СР',
    },
    service_check_ib_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во СП ИБ',
    },
    verification_activity_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во ПМ',
    },
    punished_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во наказано',
    },
    dismissed_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во уволено',
    },
    materials_transferred_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во передано материалов',
    },
    cases_initiated_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Кол-во возбуждено УД/АД',
    },
    detected_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Выявлен ущерб, руб.',
    },
    recovered_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещен ущерб, руб.',
    },
    recovered_receivables: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещена ДЗ, руб.',
    },
    prevented_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращен ущерб, руб.',
    },
    reduced_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Снижена стоимость закупки, договора, доп.согл., руб.',
    },
    prevented_writeoff_receivables: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращен о необ. списание ДЗ, руб.',
    },
    additional_income: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Получен доп. доход, руб.',
    },
    vat_deducted: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Принят к вычету НДС, руб.',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'department_id',
      },
      comment: 'Подразделение',
    },
  },
  {
    timestamps: true,
    tableName: 'explanatory_notes',
  }
);

export default ExplanatoryNote;
