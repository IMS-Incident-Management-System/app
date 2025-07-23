import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './sequelize';
import { transliterate } from '../utils/strings';

export interface EventTypeAttributes {
  event_type_id: number;
  title: string;
  value: string;
  parent_id: number | null;
}

export interface EventTypeCreationAttributes
  extends Optional<EventTypeAttributes, 'event_type_id'> {}

// Интерфейс для экземпляра модели
export interface EventTypeInstance
  extends Model<EventTypeAttributes, EventTypeCreationAttributes>,
    EventTypeAttributes {}

const EventType = sequelize.define<EventTypeInstance>('event_types', {
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
      model: 'event_types',
      key: 'event_type_id',
    }
  },
}, {
  hooks: {
    beforeValidate: async (eventType: any) => {
      if (eventType.changed('title')) {
        let value = transliterate(eventType.title);
        
        // Если есть parent_id, добавляем префикс из названия родителя
        if (eventType.parent_id) {
          const parent = await EventType.findByPk(eventType.parent_id);
          if (parent) {
            const parentPrefix = transliterate(parent.title);
            value = `${parentPrefix}_${value}`.toLowerCase();
          }
        }
        
        eventType.value = value;
      }
    }
  }
});

// Определяем связи для иерархии
EventType.belongsTo(EventType, { as: 'parent', foreignKey: 'parent_id' });
EventType.hasMany(EventType, { as: 'children', foreignKey: 'parent_id' });

export default EventType;
