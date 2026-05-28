import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { DepartmentModelType } from './department';
import { AdditionallyAttributes } from './additionally';

export interface EventAttributes {
  id: number;
  code?: string; // Уникальный код события (формат: EV-DDMMYYYY-HHmmss)
  department_id: number;
  date: Date;
  // Чекбоксы
  is_service_investigation: boolean; // Служебные расследования
  is_service_investigation_ib: boolean; // Служебные расследования ИБ
  is_service_investigation_bpio: boolean; // Служебные расследования БПиО
  is_service_investigation_bpio_hotline: boolean; // Служебные расследования БПиО (горячая линия)
  is_service_check: boolean; // Служебные проверки
  is_service_check_ib: boolean; // Служебные проверки ИБ
  is_service_check_bpio: boolean; // Служебная проверка БПиО
  is_service_check_bpio_hotline: boolean; // Служебная проверка БПиО (горячая линия)
  is_verification_activity: boolean; // Проверочные мероприятия
  is_db: boolean; // Особо важно (1ДБ)
  // Текстовые поля
  description?: string; // Текстовое поле для описания События
  entry_date?: Date; // Дата внесения события
  // Финансовые поля
  detected_damage?: number; // Выявлен ущерб (руб.)
  recovered_damage?: number; // Возмещен ущерб (руб.)
  prevented_damage?: number; // Предотвращен ущерб (руб.)
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
  prevented_unnecessary_writeoff?: number; // Предотвращено необ. списание ДЗ, руб.
  vat_deducted?: number; // Принят к вычету НДС, руб.
  created_by?: string;
  updated_by?: string;
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
    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Уникальный код события (формат: EV-DDMMYYYY-HHmmss)'
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
    is_service_investigation_ib: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные расследования ИБ',
    },
    is_service_investigation_bpio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные расследования БПиО',
    },
    is_service_investigation_bpio_hotline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебные расследования БПиО (горячая линия)',
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
      comment: 'Служебные проверки ИБ',
    },
    is_service_check_bpio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебная проверка БПиО',
    },
    is_service_check_bpio_hotline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Служебная проверка БПиО (горячая линия)',
    },
    is_verification_activity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Проверочные мероприятия',
    },
    is_db: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг "Особо важно" (1ДБ). Указывает на особый статус события, требующий специальной обработки'
    },
    entry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата внесения события',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Текстовое поле для описания События',
    },
    detected_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Выявлен ущерб (руб.)',
    },
    recovered_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещен ущерб (руб.)',
    },
    prevented_damage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращен ущерб (руб.)',
    },
    additional_income: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Получен дополнительный доход (руб.)',
    },
    reduced_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)',
    },
    prevented_unnecessary_writeoff: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Предотвращено необ. списание ДЗ, руб.',
    },
    vat_deducted: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Принят к вычету НДС, руб.',
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
    tableName: 'events',
  }
);

export default Event;

