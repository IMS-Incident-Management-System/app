import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Form,
  Card,
  Tabs,
  message,
  Spin,
  Typography,
  Checkbox,
} from "antd";
import { InfoCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { useCreateEvent } from "../../services/requests/events/createEvent";
import { CreateEventBody } from "../../interfaces/requests/event";
import { useForm } from "./hooks/useForm";
import styles from "./EventProvider.module.scss";
import { useUpdateEvent } from "../../services/requests/events/updateEvent";
import { ERoutes } from "../../enums/routes";
import { PrimaryButton } from "../../components/PrimaryButton";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { EventCriminalCase } from "./components/EventCriminalCase/EventCriminalCase";
import { EventPunishment } from "./components/EventPunishment/EventPunishment";
import { selectCanCreateEvent, selectCanUpdateEvent } from "../../store/features/permissions/selectors";

const { Title } = Typography;

export const EventProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("main");
  const canCreateEvent = useSelector(selectCanCreateEvent);
  const canUpdateEvent = useSelector(selectCanUpdateEvent);

  const { data: event, isLoading: isEventLoading } = useGetEvent(id);
  const { mutate: createEvent, isLoading: isCreatingEvent } =
    useCreateEvent();
  const { mutate: updateEvent, isLoading: isUpdatingEvent } =
    useUpdateEvent();

  const { form, onFinish } = useForm({
    event,
    createEvent,
    updateEvent,
  });

  const [isDbChecked, setIsDbChecked] = useState(false);

  // Синхронизируем локальное состояние с формой
  useEffect(() => {
    const value = form.getFieldValue('is_db');
    setIsDbChecked(value ?? false);
  }, [form, event]);

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

  const handleViewEvent = () => {
    if (id) {
      navigate(`${ERoutes.EVENT_VIEW}/${id}`);
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
          <EventCriminalCase />
          <EventPunishment />
          <div className={styles.tabActions}>
            <PrimaryButton
              size="large"
              onClick={handleSubmit}
              loading={isCreatingEvent || isUpdatingEvent}
              disabled={id ? !canUpdateEvent : !canCreateEvent}
            >
              {id ? "Сохранить изменения" : "Создать событие"}
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
          {isEventLoading ? (
            <Spin size="large" />
          ) : (
            <>
              <div className={styles.headerTop}>
                <Title level={2} className={styles.title}>
                  {id ? `Событие ${event?.code || `#${event?.id}`}` : "Создание события"}
                </Title>
                {id && (
                  <PrimaryButton
                    variant="secondary"
                    icon={<EyeOutlined />}
                    onClick={handleViewEvent}
                    className={styles.viewButton}
                  >
                    Просмотр события
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
        
        <Form<CreateEventBody>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item<CreateEventBody>
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

