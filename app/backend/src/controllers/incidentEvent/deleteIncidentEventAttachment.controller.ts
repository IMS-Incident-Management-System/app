import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentEventAttachmentService } from '../../services/incidentEventAttachment.service';

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

    const deleted = await incidentEventAttachmentService.deleteAttachment(Number(attachmentId));

    if (!deleted) {
      throw ApiError.internal('Ошибка при удалении вложения');
    }

    res.success(null, 'Вложение успешно удалено');
  }
);

