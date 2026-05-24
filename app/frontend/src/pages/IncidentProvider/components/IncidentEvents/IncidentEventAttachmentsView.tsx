<<<<<<< Updated upstream
import React from "react";
import { Card, List, Button, message, Space, Typography, Image } from "antd";
import { DeleteOutlined, DownloadOutlined, FileOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  deleteIncidentEventAttachment,
  downloadIncidentEventAttachment,
  IncidentEventAttachmentAttributes,
} from "../../../../api/incidents/incidentEventAttachments";
import { useQueryClient, useQuery } from "react-query";
import { axiosGatewayBackend } from "../../../../plugins/axios";
import styles from "./IncidentEventAttachmentsView.module.scss";

const { Text } = Typography;

interface IncidentEventAttachmentsViewProps {
  incidentEventId: number;
  attachments?: IncidentEventAttachmentAttributes[]; // Теперь опциональный
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

const EventAttachmentPreviewImage = ({
  incidentEventId,
  attachmentId,
  filename,
}: {
  incidentEventId: number;
  attachmentId: number;
  filename: string;
}) => {
  const [src, setSrc] = React.useState<string>("");

  React.useEffect(() => {
    let objectUrl = "";
    let isCancelled = false;

    const loadPreview = async () => {
      try {
        const response = await axiosGatewayBackend.get(
          `/incident-events/${incidentEventId}/attachments/${attachmentId}/download`,
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
  }, [incidentEventId, attachmentId]);

  if (!src) return null;

  return <Image src={src} alt={filename} preview={false} style={{ width: "100%", height: 200, objectFit: "cover" }} />;
};

export const IncidentEventAttachmentsView = ({
  incidentEventId,
  attachments: attachmentsProp,
  onDelete,
  showDelete = false,
}: IncidentEventAttachmentsViewProps) => {
  const queryClient = useQueryClient();
  
  // Логируем для отладки
  React.useEffect(() => {
    console.log(`IncidentEventAttachmentsView rendered with eventId: ${incidentEventId}`);
  }, [incidentEventId]);
  
  // Используем отдельный запрос для получения вложений
  const { data: attachmentsFromQuery, isLoading: isLoadingAttachments } = useQuery<IncidentEventAttachmentAttributes[]>(
    ["incidentEventAttachments", incidentEventId],
    async () => {
      if (!incidentEventId) return [];
      console.log(`Fetching attachments for eventId: ${incidentEventId}`);
      const response = await axiosGatewayBackend.get(`/incident-events/${incidentEventId}/attachments`);
      const data = (response.data?.data || response.data || []) as IncidentEventAttachmentAttributes[];
      console.log(`Received ${data.length} attachments for eventId: ${incidentEventId}`, data);
      return data;
    },
    {
      enabled: !!incidentEventId,
      staleTime: 0, // Всегда считаем данные устаревшими, чтобы гарантировать свежие данные
      cacheTime: 5 * 60 * 1000, // Кешируем на 5 минут
    }
  );
  
  // Используем пропсы, если они переданы явно (не undefined), иначе данные из запроса
  const attachments = attachmentsProp !== undefined ? attachmentsProp : (attachmentsFromQuery || []);

  const handleDelete = async (attachmentId: number) => {
    try {
      await deleteIncidentEventAttachment(incidentEventId, attachmentId);
      message.success("Файл удален");
      // Обновляем кеш для этого конкретного события
      await queryClient.refetchQueries({
        queryKey: ["incidentEventAttachments", incidentEventId],
        exact: true,
      });
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при удалении файла");
    }
  };

  const handleDownload = async (attachment: IncidentEventAttachmentAttributes) => {
    try {
      const response = await downloadIncidentEventAttachment(incidentEventId, attachment.id);
      
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
  // Если данные еще загружаются, показываем пустой список (или можно показать загрузку)
  if (!isLoadingAttachments && (!attachments || attachments.length === 0)) {
    return null;
  }

  return (
    <Card className={styles.sectionCard} title="Вложения" size="small">
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
                    <EventAttachmentPreviewImage
                      incidentEventId={incidentEventId}
                      attachmentId={attachment.id}
                      filename={attachment.filename}
                    />
                  </div>
                ) : null
              }
              actions={[
                <Button
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(attachment)}
                  size="small"
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
                        size="small"
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
    </Card>
  );
};

=======
import React from "react";
import { Card, List, Button, message, Space, Typography, Image } from "antd";
import { DeleteOutlined, DownloadOutlined, FileOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  deleteIncidentEventAttachment,
  downloadIncidentEventAttachment,
  IncidentEventAttachmentAttributes,
} from "../../../../api/incidents/incidentEventAttachments";
import { useQueryClient, useQuery } from "react-query";
import { axiosGatewayBackend } from "../../../../plugins/axios";
import styles from "./IncidentEventAttachmentsView.module.scss";

const { Text } = Typography;

interface IncidentEventAttachmentsViewProps {
  incidentEventId: number;
  attachments?: IncidentEventAttachmentAttributes[]; // Теперь опциональный
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

const EventAttachmentPreviewImage = ({
  incidentEventId,
  attachmentId,
  filename,
}: {
  incidentEventId: number;
  attachmentId: number;
  filename: string;
}) => {
  const [src, setSrc] = React.useState<string>("");

  React.useEffect(() => {
    let objectUrl = "";
    let isCancelled = false;

    const loadPreview = async () => {
      try {
        const response = await axiosGatewayBackend.get(
          `/incident-events/${incidentEventId}/attachments/${attachmentId}/download`,
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
  }, [incidentEventId, attachmentId]);

  if (!src) return null;

  return <Image src={src} alt={filename} preview={false} style={{ width: "100%", height: 200, objectFit: "cover" }} />;
};

export const IncidentEventAttachmentsView = ({
  incidentEventId,
  attachments: attachmentsProp,
  onDelete,
  showDelete = false,
}: IncidentEventAttachmentsViewProps) => {
  const queryClient = useQueryClient();
  
  // Логируем для отладки
  React.useEffect(() => {
    console.log(`IncidentEventAttachmentsView rendered with eventId: ${incidentEventId}`);
  }, [incidentEventId]);
  
  // Используем отдельный запрос для получения вложений
  const { data: attachmentsFromQuery, isLoading: isLoadingAttachments } = useQuery<IncidentEventAttachmentAttributes[]>(
    ["incidentEventAttachments", incidentEventId],
    async () => {
      if (!incidentEventId) return [];
      console.log(`Fetching attachments for eventId: ${incidentEventId}`);
      const response = await axiosGatewayBackend.get(`/incident-events/${incidentEventId}/attachments`);
      const data = (response.data?.data || response.data || []) as IncidentEventAttachmentAttributes[];
      console.log(`Received ${data.length} attachments for eventId: ${incidentEventId}`, data);
      return data;
    },
    {
      enabled: !!incidentEventId,
      staleTime: 0, // Всегда считаем данные устаревшими, чтобы гарантировать свежие данные
      cacheTime: 5 * 60 * 1000, // Кешируем на 5 минут
    }
  );
  
  // Используем пропсы, если они переданы явно (не undefined), иначе данные из запроса
  const attachments = attachmentsProp !== undefined ? attachmentsProp : (attachmentsFromQuery || []);

  const handleDelete = async (attachmentId: number) => {
    try {
      await deleteIncidentEventAttachment(incidentEventId, attachmentId);
      message.success("Файл удален");
      // Обновляем кеш для этого конкретного события
      await queryClient.refetchQueries({
        queryKey: ["incidentEventAttachments", incidentEventId],
        exact: true,
      });
      if (onDelete) {
        onDelete(attachmentId);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Ошибка при удалении файла");
    }
  };

  const handleDownload = async (attachment: IncidentEventAttachmentAttributes) => {
    try {
      const response = await downloadIncidentEventAttachment(incidentEventId, attachment.id);
      
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
  // Если данные еще загружаются, показываем пустой список (или можно показать загрузку)
  if (!isLoadingAttachments && (!attachments || attachments.length === 0)) {
    return null;
  }

  return (
    <Card className={styles.sectionCard} title="Вложения" size="small">
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
                    <EventAttachmentPreviewImage
                      incidentEventId={incidentEventId}
                      attachmentId={attachment.id}
                      filename={attachment.filename}
                    />
                  </div>
                ) : null
              }
              actions={[
                <Button
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(attachment)}
                  size="small"
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
                        size="small"
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
    </Card>
  );
};

>>>>>>> Stashed changes
