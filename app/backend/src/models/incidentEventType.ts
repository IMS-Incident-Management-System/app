import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { transliterate } from '../utils/strings';

export interface IncidentEventTypeAttributes {
  event_type_id: number;
  title: string;
  value: string;
  parent_id: number | null;
}

export interface IncidentEventTypeCreationAttributes
  extends Optional<IncidentEventTypeAttributes, 'event_type_id'> {}

// Интерфейс для экземпляра модели
export interface IncidentEventTypeInstance
  extends Model<IncidentEventTypeAttributes, IncidentEventTypeCreationAttributes>,
    IncidentEventTypeAttributes {}

const IncidentEventType = sequelize.define<IncidentEventTypeInstance>('incident_event_types', {
  event_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'incident_event_types',
      key: 'event_type_id',
    }
  },
}, {
  hooks: {
    beforeValidate: async (incidentEventType: any) => {
      if (incidentEventType.changed('title')) {
        let value = transliterate(incidentEventType.title);
        
        // Если есть parent_id, добавляем префикс из названия родителя
        if (incidentEventType.parent_id) {
          const parent = await IncidentEventType.findByPk(incidentEventType.parent_id);
          if (parent) {
            const parentPrefix = transliterate(parent.title);
            value = `${parentPrefix}_${value}`.toLowerCase();
          }
        }
        
        incidentEventType.value = value;
      }
    }
  }
});

// Определяем связи для иерархии
IncidentEventType.belongsTo(IncidentEventType, { as: 'parent', foreignKey: 'parent_id' });
IncidentEventType.hasMany(IncidentEventType, { as: 'children', foreignKey: 'parent_id' });

export default IncidentEventType;

