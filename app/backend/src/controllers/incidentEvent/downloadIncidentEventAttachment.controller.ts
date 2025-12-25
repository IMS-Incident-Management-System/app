import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentEventAttachmentService } from '../../services/incidentEventAttachment.service';
import fs from 'fs';

export const downloadIncidentEventAttachment = asyncErrorHandler(
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

    const filePath = incidentEventAttachmentService.getFilePath(attachment);

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('Файл не найден на сервере');
    }

    // Определяем, является ли файл изображением
    const isImage = attachment.mime_type.startsWith('image/');
    
    // Для изображений используем inline, для остальных - attachment
    const disposition = isImage 
      ? `inline; filename="${encodeURIComponent(attachment.filename)}"`
      : `attachment; filename="${encodeURIComponent(attachment.filename)}"`;
    
    // Отправляем файл
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Content-Type', attachment.mime_type);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res as any);
  }
);

