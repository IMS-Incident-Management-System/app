import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { explanatoryNoteRegisterService } from '../../services/explanatoryNoteRegister.service';

function parseFilters(req: Request) {
  const q = req.query;
  if (!q.period_from && !q.period_to && !q.department_id && !q.kc_r && !q.p && !q.type && !q.incident_type) {
    return undefined;
  }
  return {
    department_id: q.department_id ? Number(q.department_id) : undefined,
    period_from: q.period_from ? new Date(q.period_from as string) : undefined,
    period_to: q.period_to ? new Date(q.period_to as string) : undefined,
    kc_r: Array.isArray(q.kc_r) ? (q.kc_r as string[]) : q.kc_r ? [q.kc_r as string] : undefined,
    p: Array.isArray(q.p) ? (q.p as string[]) : q.p ? [q.p as string] : undefined,
    type: Array.isArray(q.type) ? (q.type as ('incident' | 'event' | 'additionally')[]) : q.type ? [q.type as 'incident' | 'event' | 'additionally'] : undefined,
    incident_type: Array.isArray(q.incident_type) ? (q.incident_type as string[]) : q.incident_type ? [q.incident_type as string] : undefined,
  };
}

export const exportExplanatoryNotes = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const filters = parseFilters(req);
    const buffer = await explanatoryNoteRegisterService.exportToExcel(filters);

    const periodFrom = filters?.period_from ? filters.period_from : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodTo = filters?.period_to ? filters.period_to : new Date();
    const fromStr = periodFrom.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
    const toStr = periodTo.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
    const fileName = fromStr === toStr
      ? `Пояснительная_записка_${fromStr}.xlsx`
      : `Пояснительная_записка_${fromStr}_${toStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(buffer);
  }
);
