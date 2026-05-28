import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';
import { activityBuilderService } from '../../services/activityBuilder.service';
import { activityService } from '../../services/activity.service';
import { getActivityActorContext } from '../../utils/activityContext';
import { EntityType } from '../../enums/entityActivity';

export const deleteIncidentAttachment = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id, attachmentId } = req.params;

    const attachment = await incidentAttachmentService.getAttachmentById(Number(attachmentId));
    
    if (!attachment) {
      throw ApiError.notFound('Вложение не найдено');
    }

    // Проверяем, что вложение принадлежит инциденту
    if (attachment.incident_id !== Number(id)) {
      throw ApiError.forbidden('Вложение не принадлежит данному инциденту');
    }

    const filename = attachment.filename;
    const deleted = await incidentAttachmentService.deleteAttachment(Number(attachmentId));

    if (!deleted) {
      throw ApiError.internal('Ошибка при удалении вложения');
    }

    const actor = getActivityActorContext(req);
    await activityService.record(
      activityBuilderService.buildAttachmentDeleted(
        EntityType.INCIDENT,
        Number(id),
        filename,
        actor,
        { attachment_id: Number(attachmentId) }
      )
    );

    res.success(null, 'Вложение успешно удалено');
  }
);

