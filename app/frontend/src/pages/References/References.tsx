import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  PartitionOutlined, 
  TagsOutlined, 
  AppstoreOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ERoutes } from '../../enums/routes';
import styles from './References.module.scss';

const { Title, Paragraph } = Typography;

interface ReferenceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const referencesData: ReferenceItem[] = [
  {
    id: 'departments',
    title: 'Департаменты',
    description: 'Организационная структура компании. Управление подразделениями и их иерархией.',
    icon: <PartitionOutlined />,
    route: ERoutes.DEPARTMENTS,
    color: '#1890ff'
  },
  {
    id: 'event-types',
    title: 'Типы инцидентов',
    description: 'Классификация событий и инцидентов безопасности. Настройка типов событий для системы.',
    icon: <TagsOutlined />,
    route: ERoutes.INCIDENT_EVENTS,
    color: '#52c41a'
  },
  {
    id: 'object-types',
    title: 'Типы объектов',
    description: 'Категоризация объектов защиты. Настройка классификации объектов информационной безопасности.',
    icon: <AppstoreOutlined />,
    route: ERoutes.OBJECT_TYPES,
    color: '#fa8c16'
  }
];

export const References: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>Справочники</Title>
        <Paragraph className={styles.description}>
          Централизованное управление справочными данными системы. 
          Здесь вы можете настроить все основные классификаторы и структуры данных.
        </Paragraph>
      </div>

      <div className={styles.content}>
        <Row gutter={[24, 24]}>
          {referencesData.map((reference) => (
            <Col xs={24} sm={12} lg={8} key={reference.id}>
              <Card
                className={styles.referenceCard}
                hoverable
                onClick={() => handleNavigate(reference.route)}
                style={{ 
                  '--card-color': reference.color,
                  '--card-color-dark': reference.color + 'dd'
                } as React.CSSProperties}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div 
                      className={styles.iconWrapper}
                      style={{ 
                        background: `linear-gradient(135deg, ${reference.color}10 0%, ${reference.color}25 100%)`,
                      }}
                    >
                      {reference.icon}
                    </div>
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      className={styles.arrowButton}
                    />
                  </div>
                  
                  <div className={styles.cardBody}>
                    <Title level={4} className={styles.cardTitle}>
                      {reference.title}
                    </Title>
                    <Paragraph className={styles.cardDescription}>
                      {reference.description}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className={styles.footer}>
        <Card className={styles.infoCard}>
          <Space direction="vertical" size="small">
            <Title level={5}>Дополнительная информация</Title>
            <Paragraph className={styles.infoText}>
              Все справочники поддерживают иерархическую структуру данных. 
              Изменения в справочниках влияют на работу всей системы управления инцидентами.
            </Paragraph>
            <Paragraph className={styles.infoText}>
              <strong>Важно:</strong> Перед удалением элементов справочников убедитесь, 
              что они не используются в существующих инцидентах.
            </Paragraph>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default References;
