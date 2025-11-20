import { useParams, useNavigate } from "react-router-dom";
import { Form, Card, Spin, Typography } from "antd";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { CategoryFields } from "./components/CategoryFields/CategoryFields";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { useCreateEvent } from "../../services/requests/events/createEvent";
import { useForm } from "./hooks/useForm";
import styles from "./EventProvider.module.scss";
import { useUpdateEvent } from "../../services/requests/events/updateEvent";
import { ERoutes } from "../../enums/routes";
import { PrimaryButton } from "../../components/PrimaryButton";

const { Title } = Typography;

export const EventProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      onFinish();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleViewEvent = () => {
    if (id) {
      navigate(`${ERoutes.EVENT_VIEW}/${id}`);
    }
  };

  if (isEventLoading) {
    return (
      <div className={styles.spinContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={2} className={styles.title}>
            {id ? `Событие #${id}` : "Создание события"}
          </Title>
          <div className={styles.headerActions}>
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
        </div>
        
        <div className={styles.content}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className={styles.form}
          >
            {/* Основная информация */}
            <MainInfo />

            {/* Динамические поля в зависимости от категории */}
            <CategoryFields />

            {/* Кнопки управления */}
            <div className={styles.footer}>
              <PrimaryButton
                size="large"
                onClick={handleSubmit}
                loading={isCreatingEvent || isUpdatingEvent}
                icon={<SaveOutlined />}
              >
                {id ? "Сохранить изменения" : "Создать событие"}
              </PrimaryButton>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

