import IncidentAttachment, { IncidentAttachmentCreationAttributes, IncidentAttachmentInstance } from '../models/incidentAttachment';
import { Transaction } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { MulterFile } from '../types/multer';

// Директория для хранения файлов (должна совпадать с middleware)
const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, 'incidents');

// Создаем директорию, если её нет
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class IncidentAttachmentService {
  /**
   * Сохраняет файл на диск и создает запись в БД
   * Поддерживает как memoryStorage (file.buffer), так и diskStorage (file.path)
   */
  async createAttachment(
    incidentId: number,
    file: MulterFile,
    options?: { transaction?: Transaction }
  ) {
    let storedFilename: string;
    let filePath: string;

    // Если файл уже сохранен на диск (diskStorage)
    if (file.path && file.filename) {
      filePath = file.path;
      storedFilename = file.filename;
    } else if (file.buffer) {
      // Если файл в памяти (memoryStorage) - сохраняем на диск
      const fileExtension = path.extname(file.originalname);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      storedFilename = `${uniqueSuffix}${fileExtension}`;
      filePath = path.join(UPLOAD_DIR, storedFilename);
      
      // Сохраняем файл на диск
      fs.writeFileSync(filePath, file.buffer);
    } else {
      throw new Error('File buffer or path is required');
    }

    // Создаем запись в БД
    const attachment = await IncidentAttachment.create(
      {
        incident_id: incidentId,
        filename: file.originalname,
        stored_filename: storedFilename,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.mimetype,
      },
      options
    );

    return attachment;
  }

  /**
   * Получает все вложения для инцидента
   */
  async getAttachmentsByIncidentId(incidentId: number) {
    return await IncidentAttachment.findAll({
      where: { incident_id: incidentId },
      // Используем имя колонки в БД, т.к. миграция создает поля created_at / updated_at
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Получает вложение по ID
   */
  async getAttachmentById(id: number) {
    return await IncidentAttachment.findByPk(id);
  }

  /**
   * Удаляет вложение (файл и запись в БД)
   */
  async deleteAttachment(id: number, options?: { transaction?: Transaction }) {
    const attachment = await IncidentAttachment.findByPk(id);
    if (!attachment) {
      return false;
    }

    // Удаляем файл с диска
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    // Удаляем запись из БД
    await attachment.destroy(options);
    return true;
  }

  /**
   * Удаляет все вложения для инцидента
   */
  async deleteAttachmentsByIncidentId(incidentId: number, options?: { transaction?: Transaction }) {
    const attachments = await IncidentAttachment.findAll({
      where: { incident_id: incidentId },
    });

    // Удаляем все файлы
    for (const attachment of attachments) {
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }
    }

    // Удаляем записи из БД
    return await IncidentAttachment.destroy({
      where: { incident_id: incidentId },
      ...options,
    });
  }

  /**
   * Получает количество вложений для инцидента
   */
  async getAttachmentCountByIncidentId(incidentId: number): Promise<number> {
    return await IncidentAttachment.count({
      where: { incident_id: incidentId },
    });
  }

  /**
   * Получает путь к файлу для скачивания
   */
  getFilePath(attachment: IncidentAttachmentInstance): string {
    return attachment.file_path;
  }
}

export const incidentAttachmentService = new IncidentAttachmentService();

