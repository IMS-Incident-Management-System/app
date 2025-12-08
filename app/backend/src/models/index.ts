import { sequelize } from './sequelize';
import Department from './department';
import ObjectType from './objectType';
import IncidentEventType from './incidentEventType';
import Incident from './incident';
import IncidentEvent from './incidentEvent';
import Additionally from './additionally';
import IncidentAddress from './incidentAddress';
import IncidentPerson from './incidentPerson';
import AdditionallyPerson from './additionallyPerson';
import CriminalCase from './criminalCase';
import Punishment from './punishment';
import OperationalActivity from './operationalActivity';
import IncidentObjectType from './incidentObjectType';

// IncidentEvent связи
IncidentEvent.belongsTo(IncidentEventType, { 
  foreignKey: 'event_type_id', 
  as: 'event_type',
  onDelete: 'SET NULL'
});

IncidentEvent.belongsTo(Incident, { 
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

// Связь many-to-many через промежуточную таблицу
Incident.belongsToMany(ObjectType, {
  through: IncidentObjectType,
  foreignKey: 'incident_id',
  otherKey: 'object_type_id',
  as: 'object_types'
});

ObjectType.belongsToMany(Incident, {
  through: IncidentObjectType,
  foreignKey: 'object_type_id',
  otherKey: 'incident_id',
  as: 'incidents'
});


Incident.hasMany(IncidentEvent, { 
  foreignKey: 'incident_id', 
  as: 'events',
  onDelete: 'CASCADE'
});

Incident.hasMany(Additionally, {
  foreignKey: 'incident_id',
  as: 'additionally',
  onDelete: 'CASCADE'
});

Incident.hasMany(IncidentAddress, {
  foreignKey: 'incident_id',
  as: 'addresses',
  onDelete: 'CASCADE'
});

IncidentAddress.belongsTo(Incident, {
  foreignKey: 'incident_id',
  as: 'incident'
});

Incident.hasMany(IncidentPerson, {
  foreignKey: 'incident_id',
  as: 'persons',
  onDelete: 'CASCADE'
});

IncidentPerson.belongsTo(Incident, {
  foreignKey: 'incident_id',
  as: 'incident'
});

// Обратные связи
IncidentEventType.hasMany(IncidentEvent, {
  foreignKey: 'event_type_id',
  as: 'events',
  onDelete: 'SET NULL'
});

// Additionally связи
Additionally.belongsTo(Incident, { 
  foreignKey: 'incident_id', 
  as: 'incident'
});

Additionally.hasOne(CriminalCase, {
  foreignKey: 'additionally_id',
  as: 'criminal_case',
  onDelete: 'CASCADE'
});

CriminalCase.belongsTo(Additionally, {
  foreignKey: 'additionally_id',
  as: 'additionally'
});

Additionally.hasOne(Punishment, {
  foreignKey: 'additionally_id',
  as: 'punishment',
  onDelete: 'CASCADE'
});

Punishment.belongsTo(Additionally, {
  foreignKey: 'additionally_id',
  as: 'additionally'
});

Additionally.hasMany(AdditionallyPerson, {
  foreignKey: 'additionally_id',
  as: 'persons',
  onDelete: 'CASCADE'
});

AdditionallyPerson.belongsTo(Additionally, {
  foreignKey: 'additionally_id',
  as: 'additionally'
});

// OperationalActivity связи
OperationalActivity.belongsTo(Department, { 
  foreignKey: 'department_id', 
  as: 'department'
});

// Обратная связь Department -> OperationalActivities
Department.hasMany(OperationalActivity, {
  foreignKey: 'department_id',
  as: 'operationalActivities',
  onDelete: 'CASCADE'
});

// Экспортируем все модели
export {
  Department,
  ObjectType,
  IncidentEventType,
  Incident,
  IncidentEvent,
  Additionally,
  IncidentAddress,
  IncidentPerson,
  AdditionallyPerson,
  CriminalCase,
  Punishment,
  OperationalActivity,
  IncidentObjectType,
  sequelize
}; 