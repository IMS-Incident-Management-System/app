import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';

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

    const deleted = await incidentAttachmentService.deleteAttachment(Number(attachmentId));

    if (!deleted) {
      throw ApiError.internal('Ошибка при удалении вложения');
    }

    res.success(null, 'Вложение успешно удалено');
  }
);

