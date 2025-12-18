import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';
import fs from 'fs';
import path from 'path';

export const downloadIncidentAttachment = asyncErrorHandler(
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

    const filePath = incidentAttachmentService.getFilePath(attachment);

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('Файл не найден на сервере');
    }

    // Отправляем файл
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.filename)}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res as any);
  }
);

