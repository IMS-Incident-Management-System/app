import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Spin, Space, Typography } from "antd";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { CategoryFields } from "./components/CategoryFields/CategoryFields";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { useCreateEvent } from "../../services/requests/events/createEvent";
import { useForm } from "./hooks/useForm";
import styles from "./EventProvider.module.scss";
import { useUpdateEvent } from "../../services/requests/events/updateEvent";
import { ERoutes } from "../../enums/routes";

const { Title } = Typography;

export const EventProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: isEventLoading } = useGetEvent(id);
  const { mutate: createEvent, isLoading: isCreatingEvent } =
    useCreateEvent(() => {});
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
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              {id ? `Редактирование события #${id}` : "Создание события"}
            </Title>
            {id && (
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={handleViewEvent}
              >
                Просмотр события
              </Button>
            )}
          </div>

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
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={isCreatingEvent || isUpdatingEvent}
                icon={<SaveOutlined />}
              >
                {id ? "Сохранить изменения" : "Создать событие"}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

