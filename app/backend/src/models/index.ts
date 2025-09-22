import { sequelize } from './sequelize';
import Department from './department';
import ObjectModel from './object';
import ObjectType from './objectType';
import EventType from './eventType';
import Incident from './incident';
import EventHistory from './eventHistory';
import CriminalCase from './criminalCase';
import Punishment from './punishment';
import TheftType from './incidentEvents/theft';

// EventHistory связи
EventHistory.belongsTo(EventType, { 
  foreignKey: 'event_type_id', 
  as: 'event_type',
  onDelete: 'SET NULL'
});


EventHistory.belongsTo(Incident, { 
  foreignKey: 'incident_id', 
  as: 'parent_incident',
  onDelete: 'CASCADE'
});


EventHistory.hasMany(CriminalCase, { 
  foreignKey: 'event_history_id', 
  as: 'criminal_cases',
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

Incident.hasMany(Punishment, {
  foreignKey: 'incident_id',
  as: 'punishments',
  onDelete: 'CASCADE'
});

// Обратные связи
EventType.hasMany(EventHistory, {
  foreignKey: 'event_type_id',
  as: 'event_history',
  onDelete: 'SET NULL'
});

// CriminalCase связи
CriminalCase.belongsTo(EventHistory, { 
  foreignKey: 'event_history_id', 
  as: 'event_history'
});

// Экспортируем все модели
export {
  Department,
  ObjectModel,
  ObjectType,
  EventType,
  Incident,
  EventHistory,
  CriminalCase,
  Punishment,
  TheftType,
  sequelize
}; 