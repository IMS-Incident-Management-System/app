import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';
import { AdditionallyAttributes } from './additionally';

export interface EventAttributes {
  id: number;
  department_id: number;
  date: Date;
  // Чекбоксы
  is_service_investigation: boolean; // Служебные расследования
  is_service_check: boolean; // Служебные проверки
  is_service_check_ib: boolean; // Служебные проверки по линии ИБ
  is_verification_activity: boolean; // Проверочные мероприятия
  // Текстовые поля
  quantity?: string; // Количество – текстовое поле
  description?: string; // Текстовое поле для описания События
  // Финансовые поля
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
  prevented_unnecessary_writeoff?: number; // Предотвращено необ. списание ДЗ, руб.
  vat_deducted?: number; // Принят к вычету НДС, руб.
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventWithRelations extends EventAttributes {
  department?: DepartmentModelType;
  additionally?: AdditionallyAttributes[];
}

export interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventWithRelations {}

const Event = sequelize.define<EventInstance>(
  'events',
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
      comment: 'Подразделение',
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date', // Явно указываем имя поля в БД (экранируется автоматически)
      comment: 'Дата события',
    },
    is_service_investigation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные расследования',
    },
    is_service_check: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные проверки',
    },
    is_service_check_ib: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные проверки по линии ИБ',
    },
    is_verification_activity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Проверочные мероприятия',
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Количество – текстовое поле',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Текстовое поле для описания События',
    },
    detected_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Выявлен ущерб (руб.)',
    },
    recovered_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещен ущерб (руб.)',
    },
    prevented_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращен ущерб (руб.)',
    },
    additional_income: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Получен дополнительный доход (руб.)',
    },
    reduced_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)',
    },
    prevented_unnecessary_writeoff: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращено необ. списание ДЗ, руб.',
    },
    vat_deducted: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Принят к вычету НДС, руб.',
    },
  },
  {
    timestamps: true,
    tableName: 'events',
  }
);

export default Event;

