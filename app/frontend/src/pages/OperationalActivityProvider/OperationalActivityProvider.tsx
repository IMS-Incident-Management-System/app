import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Card, Spin, Typography } from "antd";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { CategoryFields } from "./components/CategoryFields/CategoryFields";
import { useGetOperationalActivity } from "../../services/requests/operationalActivities/getOperationalActivity";
import { useCreateOperationalActivity } from "../../services/requests/operationalActivities/createOperationalActivity";
import { useForm } from "./hooks/useForm";
import styles from "./OperationalActivityProvider.module.scss";
import { useUpdateOperationalActivity } from "../../services/requests/operationalActivities/updateOperationalActivity";
import { ERoutes } from "../../enums/routes";
import { PrimaryButton } from "../../components/PrimaryButton";
import { selectCanCreateOperationalActivity, selectCanUpdateOperationalActivity } from "../../store/features/permissions/selectors";

const { Title } = Typography;

export const OperationalActivityProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canCreateOA = useSelector(selectCanCreateOperationalActivity);
  const canUpdateOA = useSelector(selectCanUpdateOperationalActivity);

  const { data: operationalActivity, isLoading: isOperationalActivityLoading } = useGetOperationalActivity(id);
  const { mutate: createOperationalActivity, isLoading: isCreatingOperationalActivity } =
    useCreateOperationalActivity();
  const { mutate: updateOperationalActivity, isLoading: isUpdatingOperationalActivity } =
    useUpdateOperationalActivity();

  const { form, onFinish } = useForm({
    operationalActivity,
    createOperationalActivity,
    updateOperationalActivity,
  });

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      onFinish();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleViewOperationalActivity = () => {
    if (id) {
      navigate(ERoutes.OPERATIONAL_ACTIVITY_VIEW_ID.replace(':id', id));
    }
  };

  if (isOperationalActivityLoading) {
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
            {id ? `Операционная деятельность ${operationalActivity?.code || `#${id}`}` : "Создание операционной деятельности"}
          </Title>
          <div className={styles.headerActions}>
            {id && (
              <PrimaryButton
                variant="secondary"
                icon={<EyeOutlined />}
                onClick={handleViewOperationalActivity}
                className={styles.viewButton}
              >
                Просмотр операционной деятельности
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
                loading={isCreatingOperationalActivity || isUpdatingOperationalActivity}
                icon={<SaveOutlined />}
                disabled={id ? !canUpdateOA : !canCreateOA}
              >
                {id ? "Сохранить изменения" : "Создать операционную деятельность"}
              </PrimaryButton>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

