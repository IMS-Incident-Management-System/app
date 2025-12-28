import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { IncidentAttributes } from './incident';
import { CriminalCaseAttributes } from './criminalCase';
import { PunishmentAttributes } from './punishment';
import { AdditionallyPersonAttributes } from './additionallyPerson';

export interface AdditionallyAttributes {
  id: number;
  incident_id: number;
  incident_event_id?: number; // ID события для прикрепления вложений
  incident_date?: Date; // Дата происшествия
  addition_date?: Date; // Дата внесения дополнения к инциденту
  text_field?: string; // Текстовое поле
  detected_damage?: number; // Выявленный ущерб
  prevented_damage?: number; // Предотвращенный ущерб
  recovered_damage?: number; // Возмещенный ущерб
  additional_income?: number; // Получен дополнительный доход (руб.)
  reduced_cost?: number; // Снижена стоимость товаров, работ и услуг на сумму (руб.)
}

export interface AdditionallyWithRelations extends AdditionallyAttributes {
  incident?: IncidentAttributes;
  criminal_case?: CriminalCaseAttributes;
  punishment?: PunishmentAttributes;
  persons?: AdditionallyPersonAttributes[];
}

export interface AdditionallyCreationAttributes extends Optional<AdditionallyAttributes, 'id'> {}

export interface AdditionallyInstance 
  extends Model<AdditionallyAttributes, AdditionallyCreationAttributes>,
    AdditionallyWithRelations {}

const Additionally = sequelize.define<AdditionallyInstance>('additionally', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'incidents',
      key: 'id',
    },
    comment: 'ID инцидента'
  },
  incident_event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'incident_events',
      key: 'id',
    },
    comment: 'ID события для прикрепления вложений'
  },
  incident_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата происшествия'
  },
  addition_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата внесения дополнения к инциденту'
  },
  text_field: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Текстовое поле'
  },
  detected_damage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Выявленный ущерб'
  },
  prevented_damage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Предотвращенный ущерб'
  },
    recovered_damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Возмещенный ущерб'
    },
    additional_income: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Получен дополнительный доход (руб.)'
    },
    reduced_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Снижена стоимость товаров, работ и услуг на сумму (руб.)'
    },
}, {
  timestamps: true,
  tableName: 'additionally'
});

export default Additionally;