import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentEventAttachmentService } from '../../services/incidentEventAttachment.service';
import { incidentEventService } from '../../services/incidentEvent.service';
import { activityBuilderService } from '../../services/activityBuilder.service';
import { activityService } from '../../services/activity.service';
import { getActivityActorContext } from '../../utils/activityContext';
import { EntityType } from '../../enums/entityActivity';

export const deleteIncidentEventAttachment = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { incidentEventId, attachmentId } = req.params;

    const attachment = await incidentEventAttachmentService.getAttachmentById(Number(attachmentId));
    
    if (!attachment) {
      throw ApiError.notFound('Вложение не найдено');
    }

    // Проверяем, что вложение принадлежит дополнению инцидента
    if (attachment.incident_event_id !== Number(incidentEventId)) {
      throw ApiError.forbidden('Вложение не принадлежит данному дополнению инцидента');
    }

    const incidentEvent = await incidentEventService.getIncidentEvent(Number(incidentEventId));
    if (!incidentEvent) {
      throw ApiError.notFound('Событие инцидента не найдено');
    }

    const filename = attachment.filename;
    const deleted = await incidentEventAttachmentService.deleteAttachment(Number(attachmentId));

    if (!deleted) {
      throw ApiError.internal('Ошибка при удалении вложения');
    }

    const actor = getActivityActorContext(req);
    await activityService.record(
      activityBuilderService.buildAttachmentDeleted(
        EntityType.INCIDENT,
        incidentEvent.incident_id,
        filename,
        actor,
        {
          attachment_id: Number(attachmentId),
          parent: 'incident_event',
          incident_event_id: Number(incidentEventId),
        }
      )
    );

    res.success(null, 'Вложение успешно удалено');
  }
);

