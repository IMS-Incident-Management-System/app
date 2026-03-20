import React from "react";
import { Card, List, Button, message, Space, Typography, Image } from "antd";
import { DeleteOutlined, DownloadOutlined, FileOutlined, EyeOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import { IncidentAttachmentAttributes } from "../../../../interfaces/requests/incident";
import {
  deleteIncidentAttachment,
  downloadIncidentAttachment,
} from "../../../../api/incidents/incidentAttachments";
import { useParams } from "react-router-dom";
import { useQueryClient, useQuery } from "react-query";
import { axiosGatewayBackend } from "../../../../plugins/axios";
import styles from "./IncidentAttachmentsView.module.scss";

const { Text } = Typography;

interface IncidentAttachmentsViewProps {
  attachments?: IncidentAttachmentAttributes[]; // Теперь опциональный, если не передан - используем запрос
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

const AttachmentPreviewImage = ({ incidentId, attachmentId, filename }: { incidentId: number; attachmentId: number; filename: string }) => {
  const [src, setSrc] = React.useState<string>("");

  React.useEffect(() => {
    let objectUrl = "";
    let isCancelled = false;

    const loadPreview = async () => {
      try {
        const response = await axiosGatewayBackend.get(
          `/incidents/${incidentId}/attachments/${attachmentId}/download`,
          { responseType: "blob" }
        );

        const blob: Blob = response instanceof Blob ? response : response.data;
        objectUrl = URL.createObjectURL(blob);
        if (!isCancelled) {
          setSrc(objectUrl);
        }
      } catch {
        if (!isCancelled) {
          setSrc("");
        }
      }
    };

    loadPreview();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [incidentId, attachmentId]);

  if (!src) return null;

  return <Image src={src} alt={filename} preview={false} style={{ width: "100%", height: 200, objectFit: "cover" }} />;
};

export const IncidentAttachmentsView = ({ 
  attachments: attachmentsProp, 
  onDelete,
  showDelete = false 
}: IncidentAttachmentsViewProps) => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // Используем отдельный запрос для получения вложений
  const { data: attachmentsFromQuery, isLoading: isLoadingAttachments } = useQuery<IncidentAttachmentAttributes[]>(
    ["incidentAttachments", id],
    async () => {
      if (!id) return [];
      const response = await axiosGatewayBackend.get(`/incidents/${id}/attachments`);
      return (response.data?.data || response.data || []) as IncidentAttachmentAttributes[];
    },
    {
      enabled: !!id,
    }
  );
  
  // Используем пропсы, если они переданы явно (не undefined), иначе данные из запроса
  const attachments = attachmentsProp !== undefined ? attachmentsProp : (attachmentsFromQuery || []);

  const handleDelete = async (attachmentId: number) => {
    if (!id) return;

    try {
      await deleteIncidentAttachment(Number(id), attachmentId);
      message.success("Файл удален");
      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries(["incidentAttachments", id]);
      queryClient.invalidateQueries(["getIncident", id]);
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при удалении файла");
    }
  };

  const handleDownload = async (attachment: IncidentAttachmentAttributes) => {
    if (!id) return;

    try {
      const response = await downloadIncidentAttachment(Number(id), attachment.id);
      
      // Интерцептор теперь возвращает весь response для blob, поэтому нужно проверить структуру
      let blob: Blob;
      if (response instanceof Blob) {
        // Если интерцептор вернул только blob
        blob = response;
      } else if (response.data instanceof Blob) {
        // Если интерцептор вернул response объект с data
        blob = response.data;
      } else {
        // Фоллбэк - создаем blob из данных
        blob = new Blob([response.data || response], { type: attachment.mime_type });
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      message.error(error?.response?.data?.message || "Ошибка при скачивании файла");
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(2) + " МБ";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileImageOutlined style={{ fontSize: 24, color: "#52c41a" }} />;
    }
    if (mimeType === "application/pdf") {
      return <FilePdfOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />;
    }
    if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FileWordOutlined style={{ fontSize: 24, color: "#1890ff" }} />;
    }
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
      return <FileExcelOutlined style={{ fontSize: 24, color: "#52c41a" }} />;
    }
    if (mimeType.includes("text")) {
      return <FileTextOutlined style={{ fontSize: 24, color: "#595959" }} />;
    }
    return <FileOutlined style={{ fontSize: 24 }} />;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  // Не показываем компонент только если данные загружены и вложений нет
  if (!isLoadingAttachments && (!attachments || attachments.length === 0)) {
    return null;
  }

  return (
    <Card className={styles.sectionCard} title="Вложения">
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={attachments}
          renderItem={(attachment) => (
            <List.Item>
              <Card
                hoverable
                className={styles.attachmentCard}
                cover={
                  isImage(attachment.mime_type) ? (
                    <div className={styles.imagePreview}>
                      {id ? (
                        <AttachmentPreviewImage
                          incidentId={Number(id)}
                          attachmentId={attachment.id}
                          filename={attachment.filename}
                        />
                      ) : null}
                    </div>
                  ) : null
                }
                actions={[
                  <Button
                    key="download"
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(attachment)}
                  >
                    Скачать
                  </Button>,
                  ...(showDelete
                    ? [
                        <Button
                          key="delete"
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(attachment.id)}
                        >
                          Удалить
                        </Button>,
                      ]
                    : []),
                ]}
              >
                <Card.Meta
                  avatar={!isImage(attachment.mime_type) ? getFileIcon(attachment.mime_type) : null}
                  title={
                    <Text ellipsis={{ tooltip: attachment.filename }}>
                      {attachment.filename}
                    </Text>
                  }
                  description={formatFileSize(attachment.file_size)}
                />
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};

