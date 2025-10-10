import { sequelize } from './sequelize';
import Department from './department';
import ObjectType from './objectType';
import EventType from './eventType';
import Incident from './incident';
import EventHistory from './eventHistory';
import Additionally from './additionally';
import Event from './event';

// EventHistory связи
EventHistory.belongsTo(EventType, { 
  foreignKey: 'event_type_id', 
  as: 'event_type',
  onDelete: 'SET NULL'
});

EventHistory.belongsTo(Incident, { 
  foreignKey: 'incident_id', 
  as: 'incident',
  onDelete: 'CASCADE'
});

// Incident связи
Incident.belongsTo(Department, { 
  foreignKey: 'department_id', 
  as: 'department'
});

Incident.belongsTo(ObjectType, { 
  foreignKey: 'object_type_id', 
  as: 'object_type'
});


Incident.hasMany(EventHistory, { 
  foreignKey: 'incident_id', 
  as: 'events',
  onDelete: 'CASCADE'
});

Incident.hasMany(Additionally, {
  foreignKey: 'incident_id',
  as: 'additionally',
  onDelete: 'CASCADE'
});

// Обратные связи
EventType.hasMany(EventHistory, {
  foreignKey: 'event_type_id',
  as: 'events',
  onDelete: 'SET NULL'
});

// Additionally связи
Additionally.belongsTo(Incident, { 
  foreignKey: 'incident_id', 
  as: 'incident'
});

// Event связи
Event.belongsTo(Department, { 
  foreignKey: 'department_id', 
  as: 'department'
});

// Обратная связь Department -> Events
Department.hasMany(Event, {
  foreignKey: 'department_id',
  as: 'events',
  onDelete: 'CASCADE'
});

// Экспортируем все модели
export {
  Department,
  ObjectType,
  EventType,
  Incident,
  EventHistory,
  Additionally,
  Event,
  sequelize
}; 