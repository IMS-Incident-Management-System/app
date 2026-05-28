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
import { MulterRequest } from '../../types/multer';

export const uploadIncidentEventAttachments = asyncErrorHandler(
  async (req: MulterRequest, res: CustomResponse) => {
    const { incidentEventId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      throw ApiError.badRequest('Файлы не были загружены');
    }

    // Проверяем существование события
    const incidentEvent = await incidentEventService.getIncidentEvent(Number(incidentEventId));
    if (!incidentEvent) {
      throw ApiError.notFound('Событие инцидента не найдено. Возможно, инцидент был обновлен. Пожалуйста, обновите страницу и попробуйте снова.');
    }

    // Проверяем количество файлов
    const currentCount = await incidentEventAttachmentService.getAttachmentCountByIncidentEventId(Number(incidentEventId));
    if (currentCount + files.length > 10) {
      throw ApiError.badRequest('Максимальное количество файлов: 10');
    }

    const actor = getActivityActorContext(req as unknown as Request);
    const incidentId = incidentEvent.incident_id;

    const attachments = await Promise.all(
      files.map(async (file) => {
        const attachment = await incidentEventAttachmentService.createAttachment(
          Number(incidentEventId),
          file
        );
        await activityService.record(
          activityBuilderService.buildAttachmentUploaded(
            EntityType.INCIDENT,
            incidentId,
            file.originalname,
            actor,
            {
              attachment_id: attachment.id,
              parent: 'incident_event',
              incident_event_id: Number(incidentEventId),
            }
          )
        );
        return attachment;
      })
    );

    res.success(attachments, 'Файлы успешно загружены');
  }
);

