import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentEventAttachmentService } from '../../services/incidentEventAttachment.service';
import { incidentEventService } from '../../services/incidentEvent.service';
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

    // Сохраняем все файлы
    const attachments = await Promise.all(
      files.map((file) =>
        incidentEventAttachmentService.createAttachment(Number(incidentEventId), file)
      )
    );

    res.success(attachments, 'Файлы успешно загружены');
  }
);

