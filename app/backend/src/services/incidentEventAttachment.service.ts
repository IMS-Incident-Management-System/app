import IncidentEventAttachment, { IncidentEventAttachmentCreationAttributes, IncidentEventAttachmentInstance } from '../models/incidentEventAttachment';
import { Transaction } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { MulterFile } from '../types/multer';

// Директория для хранения файлов (должна совпадать с middleware)
const BASE_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, 'incident-events');

// Создаем директорию, если её нет
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class IncidentEventAttachmentService {
  /**
   * Сохраняет файл на диск и создает запись в БД
   * Поддерживает как memoryStorage (file.buffer), так и diskStorage (file.path)
   */
  async createAttachment(
    incidentEventId: number,
    file: MulterFile,
    options?: { transaction?: Transaction }
  ) {
    let storedFilename: string;
    let filePath: string;

    // Если файл уже сохранен на диск (diskStorage)
    if (file.path && file.filename) {
      // Проверяем, что файл действительно существует
      if (!fs.existsSync(file.path)) {
        console.error(`File not found at path: ${file.path}`);
        throw new Error(`File not found at path: ${file.path}`);
      }
      filePath = file.path;
      storedFilename = file.filename;
      console.log(`Using file from diskStorage: ${filePath}`);
    } else if (file.buffer) {
      // Если файл в памяти (memoryStorage) - сохраняем на диск
      const fileExtension = path.extname(file.originalname);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      storedFilename = `${uniqueSuffix}${fileExtension}`;
      filePath = path.join(UPLOAD_DIR, storedFilename);
      
      // Убеждаемся, что директория существует
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      
      // Сохраняем файл на диск
      fs.writeFileSync(filePath, file.buffer);
      console.log(`Saved file from buffer to: ${filePath}`);
    } else {
      console.error('File has no path, filename, or buffer:', { path: file.path, filename: (file as any).filename, hasBuffer: !!file.buffer });
      throw new Error('File buffer or path is required');
    }

    // Создаем запись в БД
    const attachment = await IncidentEventAttachment.create(
      {
        incident_event_id: incidentEventId,
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
   * Получает все вложения для дополнения инцидента
   */
  async getAttachmentsByIncidentEventId(incidentEventId: number) {
    return await IncidentEventAttachment.findAll({
      where: { incident_event_id: incidentEventId },
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Получает вложение по ID
   */
  async getAttachmentById(id: number) {
    return await IncidentEventAttachment.findByPk(id);
  }

  /**
   * Удаляет вложение (файл и запись в БД)
   */
  async deleteAttachment(id: number, options?: { transaction?: Transaction }) {
    const attachment = await IncidentEventAttachment.findByPk(id);
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
   * Удаляет все вложения для дополнения инцидента
   */
  async deleteAttachmentsByIncidentEventId(incidentEventId: number, options?: { transaction?: Transaction }) {
    const attachments = await IncidentEventAttachment.findAll({
      where: { incident_event_id: incidentEventId },
    });

    // Удаляем все файлы
    for (const attachment of attachments) {
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }
    }

    // Удаляем записи из БД
    return await IncidentEventAttachment.destroy({
      where: { incident_event_id: incidentEventId },
      ...options,
    });
  }

  /**
   * Получает количество вложений для дополнения инцидента
   */
  async getAttachmentCountByIncidentEventId(incidentEventId: number): Promise<number> {
    return await IncidentEventAttachment.count({
      where: { incident_event_id: incidentEventId },
    });
  }

  /**
   * Получает путь к файлу для скачивания
   */
  getFilePath(attachment: IncidentEventAttachmentInstance): string {
    return attachment.file_path;
  }
}

export const incidentEventAttachmentService = new IncidentEventAttachmentService();

