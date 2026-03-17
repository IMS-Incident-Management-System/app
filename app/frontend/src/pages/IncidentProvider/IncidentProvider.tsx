import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Checkbox,
  Form,
  Card,
  Tabs,
  message,
  Spin,
  Space,
  Typography,
} from "antd";
import { InfoCircleOutlined, FileTextOutlined, EyeOutlined, PaperClipOutlined } from "@ant-design/icons";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { IncidentAdditionally, IncidentAdditionallyRef } from "./components/IncidentAdditionally/IncidentAdditionally";
import { IncidentAttachments, IncidentAttachmentsRef } from "./components/IncidentAttachments/IncidentAttachments";
import { IncidentAttachmentsView } from "./components/IncidentAttachments/IncidentAttachmentsView";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { useCreateIncident } from "../../services/requests/initiators/createIncident";
import { CreateIncidentBody } from "../../interfaces/requests/incident";
import { useForm } from "./hooks/useForm";
import styles from "./incidentProvider.module.scss";
import { useUpdateIncident } from "../../services/requests/initiators/updateIncident";
import { ERoutes } from "../../enums/routes";
import { PrimaryButton } from "../../components/PrimaryButton";
import { selectCanCreateIncident, selectCanUpdateIncident, selectCanIncidentAttachments, selectCanCreateAdditionally, selectCanUpdateAdditionally, selectCanDeleteAdditionally } from "../../store/features/permissions/selectors";

const { Title } = Typography;

export const IncidentProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("main");
  const attachmentsRef = useRef<IncidentAttachmentsRef>(null);
  const additionallyRef = useRef<IncidentAdditionallyRef>(null);
  const canCreateIncident = useSelector(selectCanCreateIncident);
  const canUpdateIncident = useSelector(selectCanUpdateIncident);
  const canIncidentAttachments = useSelector(selectCanIncidentAttachments);
  const canCreateAdditionally = useSelector(selectCanCreateAdditionally);
  const canUpdateAdditionally = useSelector(selectCanUpdateAdditionally);
  const canDeleteAdditionally = useSelector(selectCanDeleteAdditionally);

  const { data: incident, isLoading: isIncidentLoading } = useGetIncident(id);
  const createIncidentMutation = useCreateIncident();
  const updateIncidentMutation = useUpdateIncident();

  // Обертки для мутаций с загрузкой файлов
  const createIncident = React.useCallback((data: CreateIncidentBody) => {
    createIncidentMutation.mutate(data, {
      onSuccess: async (response: any) => {
        // Загружаем файлы после создания инцидента, но перед навигацией
        // Стандартный onSuccess из useCreateIncident вызывается после этого
        const incidentData = response?.data || response;
        const incidentId = incidentData?.incident?.id;
        
        if (incidentId && attachmentsRef.current) {
          const pendingFiles = attachmentsRef.current.getPendingFiles();
          if (pendingFiles.length > 0) {
            try {
              await attachmentsRef.current.uploadFiles(incidentId);
              // Инвалидируем кеш после загрузки файлов
              const { queryClient } = await import("../../plugins/query");
              queryClient.invalidateQueries({
                queryKey: ["getIncident", incidentId.toString()],
              });
              queryClient.invalidateQueries({
                queryKey: ["incidentAttachments", incidentId.toString()],
              });
            } catch (error: any) {
              console.error('Error uploading files:', error);
            }
          }
        }
      },
    });
  }, [createIncidentMutation]);

  const updateIncident = React.useCallback(({ data, id }: { data: CreateIncidentBody, id: number }) => {
    updateIncidentMutation.mutate({ data, id }, {
      onSuccess: async () => {
        const { queryClient } = await import("../../plugins/query");
        
        // Сначала инвалидируем кеш
        queryClient.invalidateQueries({
          queryKey: ["getIncident", id.toString()],
        });
        
        // Загружаем файлы для основного инцидента
        if (attachmentsRef.current) {
          const pendingFiles = attachmentsRef.current.getPendingFiles();
          if (pendingFiles.length > 0) {
            try {
              await attachmentsRef.current.uploadFiles(id);
              queryClient.invalidateQueries({
                queryKey: ["getIncident", id.toString()],
              });
              queryClient.invalidateQueries({
                queryKey: ["incidentAttachments", id.toString()],
              });
            } catch (error: any) {
              console.error('Error uploading incident files:', error);
            }
          }
        }
        
        // Ждем, пока данные обновятся (после загрузки файлов основного инцидента)
        await queryClient.refetchQueries({
          queryKey: ["getIncident", id.toString()],
        });
        
        // Загружаем файлы для дополнений (теперь у нас есть обновленные данные с новыми ID событий)
        if (additionallyRef.current) {
          try {
            await additionallyRef.current.uploadAllPendingFiles(id);
            // Инвалидируем кеш инцидента для обновления списка вложений
            queryClient.invalidateQueries({
              queryKey: ["getIncident", id.toString()],
            });
            // Не инвалидируем все incidentEventAttachments, так как они инвалидируются индивидуально в uploadAllPendingFiles
          } catch (error: any) {
            console.error('Error uploading addition files:', error);
          }
        }
      },
    });
  }, [updateIncidentMutation]);

  const { form, onFinish } = useForm({
    incident,
    isLoading: isIncidentLoading,
    createIncident,
    updateIncident,
  });

  const [isDbChecked, setIsDbChecked] = useState(false);

  // Синхронизируем локальное состояние с формой
  useEffect(() => {
    const value = form.getFieldValue('is_db');
    setIsDbChecked(value ?? false);
  }, [form, incident]);

  // Слушаем изменения в форме
  Form.useWatch('is_db', form);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      form.submit();
    } catch (error) {
      message.error("Пожалуйста, заполните все обязательные поля");
    }
  };

  const handleViewIncident = () => {
    if (id) {
      navigate(`${ERoutes.INCIDENT_VIEW}/${id}`);
    }
  };

  const tabItems = [
    {
      key: "main",
      label: (
        <span className={styles.tabLabel}>
          <InfoCircleOutlined />
          Основная информация
        </span>
      ),
      children: (
          <div className={styles.tabContent}>
            <MainInfo />
            <IncidentAttachments ref={attachmentsRef} />
            {id && (
              <IncidentAttachmentsView showDelete={canIncidentAttachments} />
            )}
            <div className={styles.tabActions}>
              <PrimaryButton
                size="large"
                onClick={handleSubmit}
                loading={createIncidentMutation.isLoading || updateIncidentMutation.isLoading}
                disabled={id ? !canUpdateIncident : !canCreateIncident}
              >
                {id ? "Сохранить изменения" : "Создать инцидент"}
              </PrimaryButton>
            </div>
          </div>
      ),
    },
    {
      key: "additions",
      label: (
        <span className={styles.tabLabel}>
          <FileTextOutlined />
          Дополнения
        </span>
      ),
      disabled: !id,
            children: (
                <div className={styles.tabContent}>
                  <IncidentAdditionally
                    ref={additionallyRef}
                    incident={incident}
                    isLoading={isIncidentLoading}
                    showDeleteAttachments={canIncidentAttachments}
                    canCreate={canCreateAdditionally}
                    canUpdate={canUpdateAdditionally}
                    canDelete={canDeleteAdditionally}
                  />
            <div className={styles.tabActions}>
              <PrimaryButton
                size="large"
                onClick={handleSubmit}
                loading={createIncidentMutation.isLoading || updateIncidentMutation.isLoading}
                disabled={!canUpdateIncident}
              >
                Сохранить
              </PrimaryButton>
            </div>
          </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.mainCard}>
        <div className={styles.header}>
          {isIncidentLoading ? (
            <Spin size="large" />
          ) : (
            <>
              <div className={styles.headerTop}>
              <Title level={2} className={styles.title}>
                {id ? `Инцидент ${incident?.code || `#${incident?.id}`}` : "Создание инцидента"}
              </Title>
              {id && (
                <PrimaryButton
                  variant="secondary"
                  icon={<EyeOutlined />}
                  onClick={handleViewIncident}
                  className={styles.viewButton}
                >
                  Просмотр инцидента
                </PrimaryButton>
              )}
              </div>
              <div className={styles.headerBottom}>
                <Checkbox 
                  className={styles.dbCheckbox}
                  checked={isDbChecked}
                  disabled={!!id}
                  onChange={(e) => {
                    if (!id) {
                      const newValue = e.target.checked;
                      setIsDbChecked(newValue);
                      form.setFieldValue('is_db', newValue);
                    }
                  }}
                >
                  <span className={styles.dbLabel}>Особо важно (1ДБ)</span>
                </Checkbox>
              </div>
            </>
          )}
        </div>
        
        <Form<CreateIncidentBody>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item<CreateIncidentBody>
            name="is_db"
            valuePropName="checked"
            style={{ display: 'none' }}
          >
            <input type="checkbox" />
          </Form.Item>
          <div className={styles.tabsContainer}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              className={styles.tabs}
              size="large"
            />
          </div>
        </Form>
      </Card>
    </div>
  );
};
