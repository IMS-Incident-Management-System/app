import { Transaction } from 'sequelize';
import { IncidentObjectType, Additionally } from '../models';
import { incidentEventService } from '../services/incidentEvent.service';
import { semanticChangeService } from '../services/semanticChange.service';

export async function getIncidentObjectTypeIds(
  incidentId: number,
  transaction?: Transaction
): Promise<number[]> {
  const rows = await IncidentObjectType.findAll({
    where: { incident_id: incidentId },
    attributes: ['object_type_id'],
    transaction,
  });
  return rows.map((r) => r.object_type_id).sort((a, b) => a - b);
}

export async function buildIncidentMainEventSnapshot(
  incidentId: number,
  transaction?: Transaction
): Promise<Record<string, unknown>> {
  const existingEvents = await incidentEventService.getIncidentEvents({ incident_id: incidentId });
  const existingAdditionally = await Additionally.findAll({
    where: { incident_id: incidentId },
    transaction,
  });
  const additionEventIds = new Set(
    existingAdditionally
      .map((a) => a.incident_event_id)
      .filter((id): id is number => id != null)
  );
  const mainEvents = existingEvents.filter((e) => !additionEventIds.has(e.id));
  const first = mainEvents[0];
  return semanticChangeService.snapshotMainEventBlock({
    event_type_ids: mainEvents
      .map((e) => e.event_type_id)
      .filter((id): id is number => id != null),
    sub_type_id: first?.sub_type_id,
    date: first?.date,
    entry_date: first?.entry_date,
  });
}
