import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { PrimaryButton } from "../../components/PrimaryButton";

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
            <div className={styles.tabActions}>
              <PrimaryButton
                size="large"
                onClick={handleSubmit}
                loading={isCreatingIncident || isUpdatingIncident}
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
            <IncidentAdditionally />
            <div className={styles.tabActions}>
              <PrimaryButton
                size="large"
                onClick={handleSubmit}
                loading={isCreatingIncident || isUpdatingIncident}
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
                {id ? `Инцидент #${incident?.id}` : "Создание инцидента"}
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
