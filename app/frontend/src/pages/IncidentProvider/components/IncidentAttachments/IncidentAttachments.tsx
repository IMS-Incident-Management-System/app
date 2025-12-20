import { Upload, Card, List, Button, message, Space, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, DownloadOutlined, FileOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { IncidentAttachmentAttributes } from "../../../../interfaces/requests/incident";
import {
  uploadIncidentAttachments,
  deleteIncidentAttachment,
  downloadIncidentAttachment,
  getIncidentAttachments,
} from "../../../../api/incidents/incidentAttachments";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import styles from "./IncidentAttachments.module.scss";

const { Text } = Typography;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ
const MAX_FILES = 10;

export const IncidentAttachments = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: attachments, isLoading } = useQuery(
    ["incidentAttachments", id],
    () => (id ? getIncidentAttachments(Number(id)) : null),
    {
      enabled: !!id,
      onSuccess: (data) => {
        if (data) {
          const files: UploadFile[] = data.map((attachment) => ({
            uid: String(attachment.id),
            name: attachment.filename,
            status: "done",
            url: undefined,
            size: attachment.file_size,
            type: attachment.mime_type,
          }));
          setFileList(files);
        }
      },
    }
  );

  const handleUpload = async () => {
    if (!id || fileList.length === 0) {
      message.warning("Выберите файлы для загрузки");
      return;
    }

    // Берем все новые файлы из списка, у которых есть originFileObj
    const filesToUpload = fileList
      .filter((file) => !!file.originFileObj)
      .map((file) => file.originFileObj as File);

    // Проверяем общее количество файлов
    const currentCount = attachments?.length || 0;
    if (currentCount + filesToUpload.length > MAX_FILES) {
      message.error(`Максимальное количество файлов: ${MAX_FILES}`);
      return;
    }

    setUploading(true);

    try {
      await uploadIncidentAttachments(Number(id), filesToUpload);
      message.success("Файлы успешно загружены");
      queryClient.invalidateQueries(["incidentAttachments", id]);
      setFileList([]);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при загрузке файлов");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!id) return;

    try {
      await deleteIncidentAttachment(Number(id), attachmentId);
      message.success("Файл удален");
      queryClient.invalidateQueries(["incidentAttachments", id]);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при удалении файла");
    }
  };

  const handleDownload = async (attachment: IncidentAttachmentAttributes) => {
    if (!id) return;

    try {
      const response = await downloadIncidentAttachment(Number(id), attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при скачивании файла");
    }
  };

  const handlePreview = async (attachment: IncidentAttachmentAttributes) => {
    if (!id) return;

    try {
      const response = await downloadIncidentAttachment(Number(id), attachment.id);
      const blob = new Blob([response.data], { type: attachment.mime_type });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при открытии файла");
    }
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      message.error(`Файл "${file.name}" превышает максимальный размер 5 МБ`);
      return Upload.LIST_IGNORE;
    }

    // Проверка общего количества файлов
    const currentCount = attachments?.length || 0;
    if (currentCount + fileList.length >= MAX_FILES) {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(2) + " МБ";
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

        {attachments && attachments.length > 0 && (
          <List
            dataSource={attachments}
            loading={isLoading}
            renderItem={(attachment) => (
              <List.Item
                actions={[
                  <Button
                    key="preview"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(attachment)}
                  >
                    Открыть
                  </Button>,
                  <Button
                    key="download"
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(attachment)}
                  >
                    Скачать
                  </Button>,
                  <Button
                    key="delete"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(attachment.id)}
                  >
                    Удалить
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileOutlined />}
                  title={attachment.filename}
                  description={formatFileSize(attachment.file_size)}
                />
              </List.Item>
            )}
          />
        )}
      </Space>
    </Card>
  );
};

