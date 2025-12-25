import { Upload, Card, Button, message, Space, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useImperativeHandle, forwardRef } from "react";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import {
  uploadIncidentEventAttachments,
  getIncidentEventAttachments,
} from "../../../../api/incidents/incidentEventAttachments";
import { useQueryClient } from "react-query";
import styles from "./IncidentEventAttachments.module.scss";

const { Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ
const MAX_FILES = 10;

interface IncidentEventAttachmentsProps {
  incidentEventId: number;
  onFilesChange?: (files: File[]) => void;
  pendingFiles?: File[];
}

export interface IncidentEventAttachmentsRef {
  uploadFiles: (incidentEventId: number) => Promise<boolean>;
  getPendingFiles: () => File[];
}

export const IncidentEventAttachments = forwardRef<IncidentEventAttachmentsRef, IncidentEventAttachmentsProps>(({
  incidentEventId,
  onFilesChange,
  pendingFiles = []
}, ref) => {
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Экспортируем функцию загрузки для использования извне
  const uploadFiles = async (eventId: number) => {
    if (fileList.length === 0) {
      return false;
    }

    // Берем все новые файлы из списка, у которых есть originFileObj
    const filesToUpload = fileList
      .filter((file) => !!file.originFileObj)
      .map((file) => file.originFileObj as File);

    if (filesToUpload.length === 0) {
      return false;
    }

    // Проверяем общее количество файлов - получаем текущие вложения из API
    const currentAttachments = await getIncidentEventAttachments(eventId);
    const currentCount = currentAttachments?.length || 0;
    if (currentCount + filesToUpload.length > MAX_FILES) {
      throw new Error(`Максимальное количество файлов: ${MAX_FILES}`);
    }

    setUploading(true);

    try {
      await uploadIncidentEventAttachments(eventId, filesToUpload);
      // Инвалидируем и обновляем кеш для вложений этого конкретного события
      await queryClient.refetchQueries({
        queryKey: ["incidentEventAttachments", eventId],
        exact: true,
      });
      setFileList([]);
      if (onFilesChange) {
        onFilesChange([]);
      }
      return true;
    } catch (error: any) {
      // Если событие не найдено (например, после обновления инцидента), показываем понятную ошибку
      if (error?.response?.status === 404 || error?.response?.data?.error?.message?.includes('не найдено')) {
        throw new Error('Событие инцидента не найдено. Возможно, инцидент был обновлен. Пожалуйста, обновите страницу и попробуйте снова.');
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!incidentEventId) {
      message.warning("Сначала сохраните дополнение");
      return;
    }

    try {
      await uploadFiles(incidentEventId);
      message.success("Файлы успешно загружены");
    } catch (error: any) {
      message.error(error?.message || error?.response?.data?.message || "Ошибка при загрузке файлов");
    }
  };

  // Экспортируем функции через ref
  useImperativeHandle(ref, () => ({
    uploadFiles,
    getPendingFiles: () => fileList
      .filter((file) => !!file.originFileObj)
      .map((file) => file.originFileObj as File),
  }));

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      message.error(`Файл "${file.name}" превышает максимальный размер 5 МБ`);
      return Upload.LIST_IGNORE;
    }

    // Проверка общего количества файлов (только новые файлы в fileList)
    if (fileList.length >= MAX_FILES) {
      message.error(`Максимальное количество файлов: ${MAX_FILES}`);
      return Upload.LIST_IGNORE;
    }

    return false; // Предотвращаем автоматическую загрузку
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];

    // Ограничиваем количество файлов
    newFileList = newFileList.slice(0, MAX_FILES);

    setFileList(newFileList);
  };

  return (
    <Card className={styles.sectionCard} title="Вложения">
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Upload
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={beforeUpload}
          multiple
          maxCount={MAX_FILES}
          listType="text"
        >
          <Button icon={<UploadOutlined />} disabled={uploading}>
            Выбрать файлы
          </Button>
        </Upload>

        {fileList.length > 0 && (
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={uploading}
          >
            Загрузить файлы
          </Button>
        )}

        <div className={styles.info}>
          <Text type="secondary">
            Максимум {MAX_FILES} файлов, каждый не более 5 МБ
          </Text>
        </div>
      </Space>
    </Card>
  );
});

