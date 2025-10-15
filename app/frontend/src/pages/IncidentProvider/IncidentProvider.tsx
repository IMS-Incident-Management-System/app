import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Checkbox,
  Form,
  Button,
  Card,
  Tabs,
  message,
  Spin,
  Space,
  Typography,
} from "antd";
import { InfoCircleOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { IncidentAdditionally } from "./components/IncidentAdditionally/IncidentAdditionally";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { useCreateIncident } from "../../services/requests/initiators/createIncident";
import { CreateIncidentBody } from "../../interfaces/requests/incident";
import { useForm } from "./hooks/useForm";
import styles from "./incidentProvider.module.scss";
import { useUpdateIncident } from "../../services/requests/initiators/updateIncident";
import { ERoutes } from "../../enums/routes";

const { Title } = Typography;

export const IncidentProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("main");

  const { data: incident, isLoading: isIncidentLoading } = useGetIncident(id);
  const { mutate: createIncident, isLoading: isCreatingIncident } =
    useCreateIncident();
  const { mutate: updateIncident, isLoading: isUpdatingIncident } =
    useUpdateIncident();

  const { form, onFinish } = useForm({
    incident,
    createIncident,
    updateIncident,
  });

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
          <div className={styles.tabActions}>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={isCreatingIncident || isUpdatingIncident}
              className={styles.saveButton}
            >
              {id ? "Сохранить изменения" : "Создать инцидент"}
            </Button>
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
          <IncidentAdditionally />
          <div className={styles.tabActions}>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={isCreatingIncident || isUpdatingIncident}
              className={styles.saveButton}
            >
              Сохранить
            </Button>
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
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title level={2} className={styles.title}>
                {id ? `Инцидент #${incident?.id}` : "Создание инцидента"}
              </Title>
              <div className={styles.headerActions}>
                <Space>
                  {id && (
                    <Button
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={handleViewIncident}
                      className={styles.viewButton}
                    >
                      Просмотр инцидента
                    </Button>
                  )}
                  <Checkbox 
                    className={styles.dbCheckbox}
                    checked={form.getFieldValue('is_db')}
                    onChange={(e) => form.setFieldValue('is_db', e.target.checked)}
                  >
                    <span className={styles.dbLabel}>Дело безопасности (1-ДБ)</span>
                  </Checkbox>
                </Space>
              </div>
            </Space>
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
