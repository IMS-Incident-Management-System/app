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

    let filePath = incidentAttachmentService.getFilePath(attachment);

    // Если путь начинается с /app, проверяем существование файла
    // Если файл не найден, возможно путь относительный
    if (!fs.existsSync(filePath)) {
      // Пытаемся использовать путь относительно текущей директории
      const relativePath = path.join(process.cwd(), 'uploads', 'incidents', path.basename(filePath));
      if (fs.existsSync(relativePath)) {
        filePath = relativePath;
      } else {
        console.error(`File not found at path: ${filePath}`);
        console.error(`Tried relative path: ${relativePath}`);
        console.error(`Current working directory: ${process.cwd()}`);
        console.error(`Attachment data:`, JSON.stringify(attachment.toJSON(), null, 2));
        throw ApiError.notFound(`Файл не найден на сервере: ${filePath}`);
      }
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

