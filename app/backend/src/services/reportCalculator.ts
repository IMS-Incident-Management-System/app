import { Op, fn, col } from 'sequelize';
import {
  Event,
  Incident,
  OperationalActivity,
  Additionally,
  Punishment,
  CriminalCase,
  IncidentEvent,
  IncidentEventType,
  EventPunishment,
  EventCriminalCase,
} from '../models';
import type { ReportFieldDef, ReportRule } from '../constants/reportFields';

const dateRangeWhere = (dateFrom: Date, dateTo: Date) => {
  const dateToEnd = new Date(dateTo);
  dateToEnd.setHours(23, 59, 59, 999);
  return { [Op.between]: [dateFrom, dateToEnd] as [Date, Date] };
};

/** Получить id типа события инцидента по названию (и опционально подтипа) */
async function getIncidentEventTypeIds(
  title: string,
  subTypeTitle?: string
): Promise<number[]> {
  const where: any = { title };
  const root = await IncidentEventType.findOne({ where });
  if (!root) return [];
  if (subTypeTitle) {
    const sub = await IncidentEventType.findOne({
      where: { title: subTypeTitle, parent_id: root.event_type_id },
    });
    return sub ? [sub.event_type_id] : [];
  }
  const children = await IncidentEventType.findAll({
    where: { parent_id: root.event_type_id },
  });
  return [root.event_type_id, ...children.map((c) => c.event_type_id)];
}

/** Подсчёт по правилу для одного департамента */
export async function computeFieldValueByRule(
  def: ReportFieldDef,
  departmentId: number,
  dateFrom: Date,
  dateTo: Date
): Promise<number> {
  const rule = def.rule;
  const createdAtWhere = { createdAt: dateRangeWhere(dateFrom, dateTo) };

  switch (rule.type) {
    case 'EVENT_SUM_BOOLEANS': {
      const or = rule.flags.map((f) => ({ [f]: true }));
      const count = await Event.count({
        where: {
          department_id: departmentId,
          ...createdAtWhere,
          [Op.or]: or,
        } as any,
      });
      return count;
    }

    case 'EVENT_COUNT_BOOLEAN': {
      const count = await Event.count({
        where: {
          department_id: departmentId,
          ...createdAtWhere,
          [rule.flag]: true,
        } as any,
      });
      return count;
    }

    case 'EVENT_EVENTS_WITH_VIOLATIONS': {
      const allFlagsTrue = Object.fromEntries(rule.flags.map((f) => [f, true]));
      const events = await Event.findAll({
        where: {
          department_id: departmentId,
          ...createdAtWhere,
          ...allFlagsTrue,
        } as any,
        include: [
          { model: EventPunishment, as: 'punishment', required: false },
          { model: EventCriminalCase, as: 'criminal_case', required: false },
        ],
      });
      let n = 0;
      for (const e of events) {
        const pun = (e as any).punishment;
        const crim = (e as any).criminal_case;
        const hasPun =
          pun &&
          (Number(pun.guilty_persons_count) ||
            Number(pun.measures_taken_count) ||
            Number(pun.warning_letter_rp398) ||
            Number(pun.remark) ||
            Number(pun.reprimand) ||
            Number(pun.dismissed_count));
        const hasCrim =
          crim &&
          (crim.transfer_date || crim.document_number || crim.case_date || crim.case_number || crim.court_decision || crim.convicted_count);
        if (hasPun || hasCrim) n++;
      }
      return n;
    }

    case 'SUM_EVENTS_INCIDENTS_ADDITIONALLY': {
      const field = rule.field as string;
      const [evSum, incSum, addIdsRows] = await Promise.all([
        Event.sum(field as any, {
          where: { department_id: departmentId, ...createdAtWhere },
        } as any),
        Incident.sum(field as any, {
          where: { department_id: departmentId, ...createdAtWhere },
        } as any),
        Additionally.findAll({
          attributes: ['id'],
          include: [{ model: Incident, as: 'incident', where: { department_id: departmentId }, required: true }],
          where: { addition_date: dateRangeWhere(dateFrom, dateTo) } as any,
        }),
      ]);
      const addIds = (addIdsRows as { id: number }[]).map((r) => r.id);
      const addSum =
        addIds.length > 0
          ? await Additionally.sum(field as any, { where: { id: { [Op.in]: addIds } } } as any)
          : 0;
      return (Number(evSum) || 0) + (Number(incSum) || 0) + (Number(addSum) || 0);
    }

    case 'EVENT_SUM_FIELD': {
      const sum = await Event.sum(rule.field as any, {
        where: { department_id: departmentId, ...createdAtWhere },
      } as any);
      return Number(sum) || 0;
    }

    case 'EVENT_SUM_VAT': {
      const sum = await Event.sum('vat_deducted', {
        where: { department_id: departmentId, ...createdAtWhere },
      } as any);
      return Number(sum) || 0;
    }

    case 'EVENT_ADDITIONALLY_SUM': {
      const eventIds = await Event.findAll({
        where: { department_id: departmentId, ...createdAtWhere },
        attributes: ['id'],
      });
      const ids = eventIds.map((e) => e.id);
      const epSum = await EventPunishment.sum(rule.source as any, {
        where: { event_id: { [Op.in]: ids } },
      } as any);
      const addIds = await Additionally.findAll({
        include: [{ model: Incident, as: 'incident', where: { department_id: departmentId }, required: true }],
        where: { addition_date: dateRangeWhere(dateFrom, dateTo) } as any,
        attributes: ['id'],
      });
      const addIdList = addIds.map((a) => a.id);
      const punSum =
        addIdList.length > 0
          ? await Punishment.sum(rule.source as any, {
              where: { additionally_id: { [Op.in]: addIdList } },
            } as any)
          : 0;
      return (Number(epSum) || 0) + (Number(punSum) || 0);
    }

    case 'EVENT_ADDITIONALLY_CRIMINAL': {
      const eventIds = await Event.findAll({
        where: { department_id: departmentId, ...createdAtWhere },
        attributes: ['id'],
      });
      const ids = eventIds.map((e) => e.id);
      const addIds = await Additionally.findAll({
        include: [{ model: Incident, as: 'incident', where: { department_id: departmentId }, required: true }],
        where: { addition_date: dateRangeWhere(dateFrom, dateTo) } as any,
        attributes: ['id'],
      });
      const addIdList = addIds.map((a) => a.id);
      if (rule.condition === 'transferred') {
        const evCount = await EventCriminalCase.count({
          where: {
            event_id: { [Op.in]: ids },
            [Op.or]: [{ transfer_date: { [Op.ne]: null } }, { document_number: { [Op.ne]: null } }],
          } as any,
        });
        const addCount =
          addIdList.length > 0
            ? await CriminalCase.count({
                where: {
                  additionally_id: { [Op.in]: addIdList },
                  [Op.or]: [{ transfer_date: { [Op.ne]: null } }, { document_number: { [Op.ne]: null } }],
                } as any,
              })
            : 0;
        return evCount + addCount;
      }
      if (rule.condition === 'rejected') {
        const evCount = await EventCriminalCase.count({
          where: { event_id: { [Op.in]: ids }, rejection_date: { [Op.not]: null } } as any,
        });
        const addCount =
          addIdList.length > 0
            ? await CriminalCase.count({
                where: { additionally_id: { [Op.in]: addIdList }, rejection_date: { [Op.not]: null } } as any,
              })
            : 0;
        return Number(evCount) + Number(addCount);
      }
      if (rule.condition === 'opened') {
        const evCount = await EventCriminalCase.count({
          where: {
            event_id: { [Op.in]: ids },
            [Op.or]: [{ case_date: { [Op.ne]: null } }, { case_number: { [Op.ne]: null } }],
          } as any,
        });
        const addCount =
          addIdList.length > 0
            ? await CriminalCase.count({
                where: {
                  additionally_id: { [Op.in]: addIdList },
                  [Op.or]: [{ case_date: { [Op.ne]: null } }, { case_number: { [Op.ne]: null } }],
                } as any,
              })
            : 0;
        return evCount + addCount;
      }
      if (rule.condition === 'closed') {
        const evCount = await EventCriminalCase.count({
          where: {
            event_id: { [Op.in]: ids },
            [Op.or]: [{ court_decision: { [Op.ne]: null } }, { convicted_count: { [Op.ne]: null } }],
          } as any,
        });
        const addCount =
          addIdList.length > 0
            ? await CriminalCase.count({
                where: {
                  additionally_id: { [Op.in]: addIdList },
                  [Op.or]: [{ court_decision: { [Op.ne]: null } }, { convicted_count: { [Op.ne]: null } }],
                } as any,
              })
            : 0;
        return evCount + addCount;
      }
      return 0;
    }

    case 'OA_FIELD':
    case 'OA_FIELD_OPT': {
      const periodWhere = {
        [Op.and]: [
          { period_from: { [Op.lte]: dateTo } },
          { period_to: { [Op.gte]: dateFrom } },
        ],
      };
      const sum = await OperationalActivity.sum(rule.field as any, {
        where: {
          department_id: departmentId,
          direction: rule.direction,
          ...periodWhere,
        } as any,
      } as any);
      return Number(sum) || 0;
    }

    case 'OA_SUM_FIELDS': {
      const periodWhere = {
        [Op.and]: [
          { period_from: { [Op.lte]: dateTo } },
          { period_to: { [Op.gte]: dateFrom } },
        ],
      };
      let total = 0;
      for (const f of rule.fields) {
        const s = await OperationalActivity.sum(f as any, {
          where: {
            department_id: departmentId,
            direction: rule.direction,
            ...periodWhere,
          } as any,
        } as any);
        total += Number(s) || 0;
      }
      return total;
    }

    case 'INCIDENT_COUNT_BY_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle, rule.subTypeTitle);
      if (typeIds.length === 0) return 0;
      const incidents = await Incident.findAll({
        where: { department_id: departmentId, ...createdAtWhere },
        include: [
          {
            model: IncidentEvent,
            as: 'events',
            required: true,
            where: { event_type_id: { [Op.in]: typeIds } },
          },
        ],
      });
      return incidents.length;
    }

    case 'INCIDENT_SUM_BY_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle);
      if (typeIds.length === 0) return 0;
      const count = await Incident.count({
        where: { department_id: departmentId, ...createdAtWhere },
        include: [
          {
            model: IncidentEvent,
            as: 'events',
            required: true,
            where: { event_type_id: { [Op.in]: typeIds } },
          },
        ],
      });
      return count;
    }

    case 'ADDITIONALLY_BY_INCIDENT_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle);
      if (typeIds.length === 0) return 0;
      const incidentsInDept = await Incident.findAll({
        where: { department_id: departmentId, createdAt: dateRangeWhere(dateFrom, dateTo) } as any,
        attributes: ['id'],
      });
      const deptIncidentIds = incidentsInDept.map((i) => i.id);
      if (deptIncidentIds.length === 0) return 0;
      const withType = await IncidentEvent.findAll({
        where: { event_type_id: { [Op.in]: typeIds }, incident_id: { [Op.in]: deptIncidentIds } },
        attributes: ['incident_id'],
      });
      const incidentIds = [...new Set(withType.map((r) => r.incident_id))];
      if (incidentIds.length === 0) return 0;
      const addList = await Additionally.findAll({
        where: {
          incident_id: { [Op.in]: incidentIds },
          addition_date: dateRangeWhere(dateFrom, dateTo),
        } as any,
        attributes: ['id'],
      });
      const addIds = addList.map((a) => a.id);
      if (addIds.length === 0) return 0;
      if (rule.container === 'punishment') {
        const sum = await Punishment.sum(rule.field as any, {
          where: { additionally_id: { [Op.in]: addIds } },
        } as any);
        return Number(sum) || 0;
      }
      const sum = await Additionally.sum(rule.field as any, {
        where: { id: { [Op.in]: addIds } },
      } as any);
      return Number(sum) || 0;
    }

    case 'ADDITIONALLY_CRIMINAL_BY_INCIDENT_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle);
      if (typeIds.length === 0) return 0;
      const incidentsInDept = await Incident.findAll({
        where: { department_id: departmentId, createdAt: dateRangeWhere(dateFrom, dateTo) } as any,
        attributes: ['id'],
      });
      const deptIncidentIds = incidentsInDept.map((i) => i.id);
      if (deptIncidentIds.length === 0) return 0;
      const withType = await IncidentEvent.findAll({
        where: { event_type_id: { [Op.in]: typeIds }, incident_id: { [Op.in]: deptIncidentIds } },
        attributes: ['incident_id'],
      });
      const incidentIds = [...new Set(withType.map((r) => r.incident_id))];
      if (incidentIds.length === 0) return 0;
      const addList = await Additionally.findAll({
        where: {
          incident_id: { [Op.in]: incidentIds },
          addition_date: dateRangeWhere(dateFrom, dateTo),
        } as any,
        attributes: ['id'],
      });
      const addIds = addList.map((a) => a.id);
      if (addIds.length === 0) return 0;
      if (rule.condition === 'transferred') {
        return await CriminalCase.count({
          where: {
            additionally_id: { [Op.in]: addIds },
            [Op.or]: [{ transfer_date: { [Op.ne]: null } }, { document_number: { [Op.ne]: null } }],
          } as any,
        });
      }
      if (rule.condition === 'opened') {
        return await CriminalCase.count({
          where: {
            additionally_id: { [Op.in]: addIds },
            [Op.or]: [{ case_date: { [Op.ne]: null } }, { case_number: { [Op.ne]: null } }],
          } as any,
        });
      }
      if (rule.condition === 'closed') {
        return await CriminalCase.count({
          where: {
            additionally_id: { [Op.in]: addIds },
            [Op.or]: [{ court_decision: { [Op.ne]: null } }, { convicted_count: { [Op.ne]: null } }],
          } as any,
        });
      }
      return 0;
    }

    case 'ADDITIONALLY_PUNISHMENT_SUM_BY_INCIDENT_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle);
      if (typeIds.length === 0) return 0;
      const incidentsInDept = await Incident.findAll({
        where: { department_id: departmentId, createdAt: dateRangeWhere(dateFrom, dateTo) } as any,
        attributes: ['id'],
      });
      const deptIncidentIds = incidentsInDept.map((i) => i.id);
      if (deptIncidentIds.length === 0) return 0;
      const withType = await IncidentEvent.findAll({
        where: { event_type_id: { [Op.in]: typeIds }, incident_id: { [Op.in]: deptIncidentIds } },
        attributes: ['incident_id'],
      });
      const incidentIds = [...new Set(withType.map((r) => r.incident_id))];
      if (incidentIds.length === 0) return 0;
      const addList = await Additionally.findAll({
        where: {
          incident_id: { [Op.in]: incidentIds },
          addition_date: dateRangeWhere(dateFrom, dateTo),
        } as any,
        attributes: ['id'],
      });
      const addIds = addList.map((a) => a.id);
      if (addIds.length === 0) return 0;
      let total = 0;
      for (const f of rule.fields) {
        const s = await Punishment.sum(f as any, {
          where: { additionally_id: { [Op.in]: addIds } },
        } as any);
        total += Number(s) || 0;
      }
      return total;
    }

    case 'EVENT_COUNT_BOOLEANS_SUM': {
      let n = 0;
      for (const flag of rule.flags) {
        const c = await Event.count({
          where: {
            department_id: departmentId,
            ...createdAtWhere,
            [flag]: true,
          } as any,
        });
        n += c;
      }
      return n;
    }

    case 'EVENT_IB_CHECKS_SUM': {
      let n = 0;
      for (const flag of rule.flags) {
        const c = await Event.count({
          where: {
            department_id: departmentId,
            ...createdAtWhere,
            [flag]: true,
          } as any,
        });
        n += c;
      }
      return n;
    }

    case 'EVENT_COUNT_ALL_BOOLEANS': {
      const allFlagsTrue = Object.fromEntries(rule.flags.map((f) => [f, true]));
      const count = await Event.count({
        where: {
          department_id: departmentId,
          ...createdAtWhere,
          ...allFlagsTrue,
        } as any,
      });
      return count;
    }

    case 'INCIDENT_EVENT_TRAUMA': {
      const root = await IncidentEventType.findOne({
        where: { title: 'Травма / Смертельный исход', parent_id: null },
      });
      if (!root) return 0;
      const incidentIds = await Incident.findAll({
        where: { department_id: departmentId, ...createdAtWhere },
        attributes: ['id'],
      }).then((r) => r.map((i) => i.id));
      if (incidentIds.length === 0) return 0;
      const ieWhere: any = {
        incident_id: { [Op.in]: incidentIds },
        event_type_id: root.event_type_id,
      };
      if (rule.employeeOnly) {
        return await IncidentEvent.count({
          where: { ...ieWhere, employee_number: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } } as any,
        });
      }
      return await IncidentEvent.count({ where: ieWhere });
    }

    case 'INCIDENT_COUNT_EVENT_TYPE': {
      const typeIds = await getIncidentEventTypeIds(rule.eventTypeTitle);
      if (typeIds.length === 0) return 0;
      const count = await Incident.count({
        where: { department_id: departmentId, ...createdAtWhere },
        include: [
          {
            model: IncidentEvent,
            as: 'events',
            required: true,
            where: { event_type_id: { [Op.in]: typeIds } },
          },
        ],
      });
      return count;
    }

    default:
      return 0;
  }
}
