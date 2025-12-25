import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';
import { MulterRequest } from '../../types/multer';

export const uploadIncidentAttachments = asyncErrorHandler(
  async (req: MulterRequest, res: CustomResponse) => {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      throw ApiError.badRequest('Файлы не были загружены');
    }

    // Проверяем количество файлов
    const currentCount = await incidentAttachmentService.getAttachmentCountByIncidentId(Number(id));
    if (currentCount + files.length > 10) {
      throw ApiError.badRequest('Максимальное количество файлов: 10');
    }

    // Сохраняем все файлы
    const attachments = await Promise.all(
      files.map((file) =>
        incidentAttachmentService.createAttachment(Number(id), file)
      )
    );

    res.success(attachments, 'Файлы успешно загружены');
  }
);

