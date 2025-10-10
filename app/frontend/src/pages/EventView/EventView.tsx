import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Descriptions,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useGetEvent } from "../../services/requests/events/getEvent";
import { ERoutes } from "../../enums/routes";
import {
  EventDirectionLabels,
  getCategoryLabel,
} from "../../enums/event";
import dayjs from "dayjs";
import styles from "./EventView.module.scss";

const { Title } = Typography;

export const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useGetEvent(id);

  const handleBack = () => {
    navigate(ERoutes.EVENTS_LIST);
  };

  const handleEdit = () => {
    navigate(`${ERoutes.EVENT_CREATE}/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.container}>
        <Card>
          <p>Событие не найдено</p>
          <Button onClick={handleBack}>Назад к списку</Button>
        </Card>
      </div>
    );
  }

  const getDirectionColor = (direction: string) => {
    if (direction === 'INFORMATION') return 'blue';
    if (direction === 'ECONOMIC') return 'green';
    if (direction === 'SECURITY') return 'orange';
    return 'default';
  };

  // Функция для рендеринга значения поля
  const renderFieldValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Не указано</span>;
    }
    return value;
  };

  // Функция для рендеринга числового поля с суммой
  const renderMoneyField = (value: any) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>0.00 руб.</span>;
    }
    return `${Number(value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб.`;
  };

  // Функция для рендеринга числового поля
  const renderNumberField = (value: any) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>0</span>;
    }
    return Number(value).toLocaleString('ru-RU');
  };

  // Функция для получения всех непустых полей события
  const getEventFields = () => {
    const fields: Array<{ label: string; value: any }> = [];
    
    // Определяем поля в зависимости от категории
    const fieldMappings: Record<string, Array<{ key: string; label: string; type?: 'money' | 'number' | 'text' }>> = {
      // ЭБ - DEBT_RECOVERY
      'DEBT_RECOVERY': [
        { key: 'total_debt', label: 'Общий размер ДЗ', type: 'money' },
        { key: 'overdue_debt', label: 'Размер просроченной ДЗ', type: 'money' },
        { key: 'overdue_debt_sb', label: 'ПДЗ, переданная в СБ', type: 'money' },
        { key: 'recovered_debt', label: 'Взыскано ДЗ', type: 'money' },
        { key: 'available_vat', label: 'Доступный к возмещению НДС', type: 'money' },
        { key: 'vat_assistance', label: 'Содействие в получении НДС', type: 'money' },
        { key: 'written_off_debt', label: 'Размер списанной ДЗ', type: 'money' },
        { key: 'prevented_writeoff', label: 'Предотвращено списания ДЗ', type: 'money' },
      ],
      // ... Можно добавить остальные категории аналогично
    };

    const categoryFields = fieldMappings[event.category] || [];
    
    categoryFields.forEach(({ key, label, type }) => {
      const value = (event as any)[key];
      if (value !== null && value !== undefined && value !== '' && value !== 0) {
        fields.push({
          label,
          value: type === 'money' 
            ? renderMoneyField(value)
            : type === 'number'
            ? renderNumberField(value)
            : value
        });
      }
    });

    // Если нет специфичных полей, покажем все непустые поля
    if (fields.length === 0) {
      Object.keys(event).forEach((key) => {
        if (
          ![
            'id',
            'department_id',
            'created_by',
            'period_date',
            'direction',
            'category',
            'createdAt',
            'updatedAt',
            'department',
          ].includes(key)
        ) {
          const value = (event as any)[key];
          if (value !== null && value !== undefined && value !== '' && value !== 0) {
            fields.push({ label: key, value: renderFieldValue(value) });
          }
        }
      });
    }

    return fields;
  };

  const eventFields = getEventFields();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Заголовок и кнопки */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                size="large"
              >
                Назад
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                Просмотр события #{event.id}
              </Title>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              size="large"
            >
              Редактировать
            </Button>
          </div>

          {/* Основная информация */}
          <Card title="Основная информация" className={styles.sectionCard}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID события">
                {event.id}
              </Descriptions.Item>
              <Descriptions.Item label="Подразделение">
                {event.department?.title || "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Период">
                {event.period_date
                  ? dayjs(event.period_date).format("DD.MM.YYYY")
                  : "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Направление">
                <Tag color={getDirectionColor(event.direction)}>
                  {EventDirectionLabels[event.direction] || event.direction}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Категория" span={2}>
                <Tag color="purple">{getCategoryLabel(event.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Создал">
                {event.created_by || "Не указано"}
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {event.createdAt
                  ? dayjs(event.createdAt).format("DD.MM.YYYY HH:mm")
                  : "Не указано"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Данные события */}
          {eventFields.length > 0 && (
            <Card title="Данные события" className={styles.sectionCard}>
              <Descriptions column={1} bordered>
                {eventFields.map((field, index) => (
                  <Descriptions.Item key={index} label={field.label}>
                    {field.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}

          {eventFields.length === 0 && (
            <Card className={styles.sectionCard}>
              <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                Дополнительные данные не заполнены
              </p>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

