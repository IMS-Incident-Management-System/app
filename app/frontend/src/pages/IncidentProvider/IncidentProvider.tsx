import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Checkbox,
  Form,
  Button,
  Card,
  Steps,
  message,
  Spin,
  Space,
  Typography,
} from "antd";
import { MainInfo } from "./components/MainInfo/MainInfo";
import { IncidentAdditionally } from "./components/IncidentAdditionally/IncidentAdditionally";
import { useGetIncident } from "../../services/requests/initiators/getIncident";
import { useCreateIncident } from "../../services/requests/initiators/createIncident";
import { CreateIncidentBody } from "../../interfaces/requests/incident";
import { useForm } from "./hooks/useForm";
import styles from "./incidentProvider.module.scss";
import { useUpdateIncident } from "../../services/requests/initiators/updateIncident";

const { Title } = Typography;

export const IncidentProvider = () => {
  const { id } = useParams();
  const location = useLocation();
  const isDuplicate = location.pathname.includes("duplicate");
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<boolean[]>([false, false]);
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState<boolean[]>([false, false]);

  const { data: incident, isLoading: isIncidentLoading } = useGetIncident(id);
  const { mutate: createIncident, isLoading: isCreatingIncident } =
    useCreateIncident(() => {});
  const { mutate: updateIncident, isLoading: isUpdatingIncident } =
    useUpdateIncident();

  const { form, onFinish } = useForm({
    incident,
    createIncident,
    updateIncident,
    isDuplicate,
  });

  // Инициализируем состояние ошибок как false (без валидации)
  useEffect(() => {
    setStepErrors([false, false]);
  }, []);

  // Кнопка всегда активна, валидация происходит при сохранении

  // Очищаем ошибки текущего шага при изменении полей
  const clearCurrentStepError = () => {
    setStepErrors(prev => {
      const newErrors = [...prev];
      newErrors[currentStep] = false;
      return newErrors;
    });
  };

  // Проверяем валидность поля при изменении (только если была попытка валидации)
  const checkFieldValidity = async (fieldName: string) => {
    if (hasAttemptedValidation[currentStep]) {
      try {
        await form.validateFields([fieldName]);
        // Поле валидно - очищаем ошибку
        setStepErrors(prev => {
          const newErrors = [...prev];
          newErrors[currentStep] = false;
          return newErrors;
        });
      } catch {
        // Поле невалидно - показываем ошибку
        setStepErrors(prev => {
          const newErrors = [...prev];
          newErrors[currentStep] = true;
          return newErrors;
        });
      }
    }
  };

  const steps = [
    {
      title: "Основная информация",
      content: <MainInfo />,
    },
    {
      title: "Дополнения",
      content: <IncidentAdditionally />,
    },
  ];

  const validateStep = (stepIndex: number, showErrors: boolean = true) => {
    const fieldsToValidate = stepIndex === 0 
      ? ['department_id', 'direction', 'event.event_type_id', 'event.date']
      : ['additionally'];
    
    return form.validateFields(fieldsToValidate)
      .then(() => {
        // Шаг валиден
        setStepErrors(prev => {
          const newErrors = [...prev];
          newErrors[stepIndex] = false;
          return newErrors;
        });
        setHasAttemptedValidation(prev => {
          const newAttempted = [...prev];
          newAttempted[stepIndex] = true;
          return newAttempted;
        });
        return true;
      })
      .catch(() => {
        // Шаг невалиден - показываем ошибки только если была попытка валидации
        if (showErrors) {
          setStepErrors(prev => {
            const newErrors = [...prev];
            newErrors[stepIndex] = true;
            return newErrors;
          });
          setHasAttemptedValidation(prev => {
            const newAttempted = [...prev];
            newAttempted[stepIndex] = true;
            return newAttempted;
          });
        }
        return false;
      });
  };

  const validateAllSteps = async (showErrors: boolean = false) => {
    const step0Valid = await validateStep(0, showErrors);
    const step1Valid = await validateStep(1, showErrors);
    const allValid = step0Valid && step1Valid;
    return allValid;
  };

  const nextStep = () => {
    validateStep(currentStep).then((isValid) => {
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        message.error("Пожалуйста, заполните все обязательные поля текущего шага");
      }
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = async (step: number) => {
    // Если переходим на предыдущий шаг - разрешаем
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }
    
    // Если переходим на следующий шаг - валидируем текущий
    if (step > currentStep) {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCurrentStep(step);
      } else {
        message.error("Пожалуйста, заполните все обязательные поля текущего шага");
      }
      return;
    }
    
    // Если кликнули на текущий шаг - ничего не делаем
  };

  const handleSubmit = async () => {
    const allValid = await validateAllSteps(true); // Показываем ошибки при попытке сохранения
    
    if (allValid) {
      form.submit();
      message.success("Форма успешно отправлена!");
    } else {
      message.error("Пожалуйста, заполните все обязательные поля во всех шагах");
    }
  };

  const items = steps.map((item, index) => ({ 
    key: item.title, 
    title: item.title,
    description: currentStep === 0 ? "Основные данные и событие" : "Дополнительная информация",
    status: (stepErrors[index] && hasAttemptedValidation[index]) ? 'error' as const : undefined
  }));

  return (
    <div className={styles.container}>
      <Card className={styles.mainCard}>
        <div className={styles.header}>
          {isIncidentLoading || isCreatingIncident || isUpdatingIncident ? (
            <Spin size="large" />
          ) : (
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Title level={2} className={styles.title}>
                {id && !isDuplicate
                  ? `Инцидент #${incident?.id}`
                  : "Создание инцидента"}
              </Title>
              <div className={styles.headerActions}>
                <Checkbox 
                  className={styles.dbCheckbox}
                  checked={form.getFieldValue('is_db')}
                  onChange={(e) => form.setFieldValue('is_db', e.target.checked)}
                >
                  <span className={styles.dbLabel}>Дело безопасности (1-ДБ)</span>
                </Checkbox>
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
          
          <div className={styles.stepsContainer}>
            <Steps
              current={currentStep}
              items={items}
              onChange={handleStepClick}
              className={styles.steps}
            />
            
            <div className={styles.stepsContent}>
              {steps[currentStep].content}
            </div>
            
            <div className={styles.stepsActions}>
              {currentStep > 0 && (
                <Button 
                  size="large"
                  onClick={prevStep}
                  className={styles.prevButton}
                >
                  Назад
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={nextStep}
                  className={styles.nextButton}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={isCreatingIncident || isUpdatingIncident}
                  className={id && !isDuplicate ? styles.saveButton : styles.submitButton}
                >
                  {id && !isDuplicate ? "Сохранить изменения" : "Создать инцидент"}
                </Button>
              )}
              
              {/* Показываем кнопку "Сохранить изменения" на всех этапах при редактировании */}
              {id && !isDuplicate && currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={isCreatingIncident || isUpdatingIncident}
                  className={styles.saveButton}
                >
                  Сохранить изменения
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};
