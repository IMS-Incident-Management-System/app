import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Checkbox,
  Form,
  Button,
  Card,
  Steps,
  message,
  Select,
  Spin,
} from "antd";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { IncidentEvents } from "./components/IncidentEvents/IncidentEvents";
import { IncidentAdditionally } from "./components/IncidentAdditionally/IncidentAdditionally";
import { IncidentPunishments } from "./components/IncidentPunishments/IncidentPunishments";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { useCreateIncident } from "../../services/requests/initiators/createIncident";
import { CreateIncidentBody } from "../../interfaces/requests/incident";
import { useForm } from "./hooks/useForm";
import styles from "./incidentProvider.module.scss";
import { useUpdateIncident } from "../../services/requests/initiators/updateIncident";

export const IncidentProvider = () => {
  const { id } = useParams();
  const location = useLocation();
  const isDuplicate = location.pathname.includes("duplicate");
  const [currentStep, setCurrentStep] = useState(0);

  const handleSetStep = (step: number) => {
    setCurrentStep(step);
  };

  const { data: incident, isLoading: isIncidentLoading } = useGetIncident(id);
  const { mutate: createIncident, isLoading: isCreatingIncident } =
    useCreateIncident(handleSetStep);
  const { mutate: updateIncident, isLoading: isUpdatingIncident } =
    useUpdateIncident();

  const { form, onFinish } = useForm({
    incident,
    createIncident,
    updateIncident,
    isDuplicate,
  });

  const steps = [
    {
      title: "Основная информация",
      content: (
        <MainInfo />
      ),
    },
    {
      title: "Инциденты",
      content: <IncidentEvents />,
    },
    {
      title: "Наказания",
      content: <IncidentPunishments />,
    },
    {
      title: "Дополнительно",
      content: <IncidentAdditionally />,
    },
  ];

  const nextStep = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values on next step:", values);
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
        console.log("Validation failed:", error);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <Card className={styles.card}>
      <Form<CreateIncidentBody>
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <div className={styles.header}>
          {isIncidentLoading || isCreatingIncident || isUpdatingIncident ? (
            <Spin />
          ) : (
            <>
              <h2>
                {id && !isDuplicate
                  ? `Инцидент - id:${incident?.id}`
                  : "Создание инцидента"}
              </h2>
            </>
          )}
          <div className={styles.headerActions}>
            <Form.Item<CreateIncidentBody>
              name="is_db"
              className={styles.formItem}
              valuePropName="checked"
            >
              <Checkbox>1-ДБ</Checkbox>
            </Form.Item>
            
          </div>
        </div>
        <div className={styles.stepsContainer}>
          <Steps
            current={currentStep}
            items={items}
            onChange={setCurrentStep}
          />
          <div className={styles.stepsContent}>
            {steps[currentStep].content}
          </div>
          <div className={styles.stepsActions}>
            {currentStep > 0 && (
              <Button style={{ margin: "0 8px" }} onClick={() => prevStep()}>
                Назад
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => nextStep()}>
                Далее
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  form.validateFields().then(() => {
                    form.submit();
                    message.success("Форма успешно отправлена!");
                  });
                }}
              >
                {id && !isDuplicate ? "Изменить" : "Отправить на согласование"}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Card>
  );
};
