<<<<<<< Updated upstream
import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  PartitionOutlined, 
  TagsOutlined, 
  AppstoreOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ERoutes } from '../../enums/routes';
import styles from './References.module.scss';
import { PageHeader } from '../../components/PageHeader';
import { selectCan, selectCanReferencesList } from '../../store/features/permissions/selectors';

const { Title, Paragraph } = Typography;

interface ReferenceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  entity: string;
}

const referencesData: ReferenceItem[] = [
  {
    id: 'departments',
    title: 'Подразделения',
    description: 'Организационная структура компании. Управление подразделениями и их иерархией.',
    icon: <PartitionOutlined />,
    route: ERoutes.DEPARTMENTS,
    color: '#1890ff',
    entity: 'department',
  },
  {
    id: 'event-types',
    title: 'Типы инцидентов',
    description: 'Классификация событий и инцидентов безопасности. Настройка типов событий для системы.',
    icon: <TagsOutlined />,
    route: ERoutes.INCIDENT_EVENTS,
    color: '#52c41a',
    entity: 'event_type',
  },
  {
    id: 'object-types',
    title: 'Типы объектов',
    description: 'Категоризация объектов защиты. Настройка классификации объектов информационной безопасности.',
    icon: <AppstoreOutlined />,
    route: ERoutes.OBJECT_TYPES,
    color: '#fa8c16',
    entity: 'object_type',
  }
];

export const References: React.FC = () => {
  const navigate = useNavigate();
  const canReferencesList = useSelector(selectCanReferencesList);
  const canDepartmentList = useSelector(selectCan('department', 'list'));
  const canEventTypeList = useSelector(selectCan('event_type', 'list'));
  const canObjectTypeList = useSelector(selectCan('object_type', 'list'));
  const visibleReferences = referencesData.filter((ref) => {
    if (ref.entity === 'department') return canDepartmentList;
    if (ref.entity === 'event_type') return canEventTypeList;
    if (ref.entity === 'object_type') return canObjectTypeList;
    return true;
  });

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  if (!canReferencesList) {
    return (
      <div className={styles.container}>
        <PageHeader title="Справочники" />
        <Card>
          <Typography.Text type="secondary">Нет доступа к разделу.</Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Справочники" />
      <div className={styles.description}>
        <Paragraph>
          Централизованное управление справочными данными системы. 
          Здесь вы можете настроить все основные классификаторы и структуры данных.
        </Paragraph>
      </div>

      <div className={styles.content}>
        <Row gutter={[24, 24]}>
          {visibleReferences.map((reference) => (
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
=======
import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  PartitionOutlined, 
  TagsOutlined, 
  AppstoreOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ERoutes } from '../../enums/routes';
import styles from './References.module.scss';
import { PageHeader } from '../../components/PageHeader';
import { selectCan, selectCanReferencesList } from '../../store/features/permissions/selectors';

const { Title, Paragraph } = Typography;

interface ReferenceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  entity: string;
}

const referencesData: ReferenceItem[] = [
  {
    id: 'departments',
    title: 'Подразделения',
    description: 'Организационная структура компании. Управление подразделениями и их иерархией.',
    icon: <PartitionOutlined />,
    route: ERoutes.DEPARTMENTS,
    color: '#1890ff',
    entity: 'department',
  },
  {
    id: 'event-types',
    title: 'Типы инцидентов',
    description: 'Классификация событий и инцидентов безопасности. Настройка типов событий для системы.',
    icon: <TagsOutlined />,
    route: ERoutes.INCIDENT_EVENTS,
    color: '#52c41a',
    entity: 'event_type',
  },
  {
    id: 'object-types',
    title: 'Типы объектов',
    description: 'Категоризация объектов защиты. Настройка классификации объектов информационной безопасности.',
    icon: <AppstoreOutlined />,
    route: ERoutes.OBJECT_TYPES,
    color: '#fa8c16',
    entity: 'object_type',
  }
];

export const References: React.FC = () => {
  const navigate = useNavigate();
  const canReferencesList = useSelector(selectCanReferencesList);
  const canDepartmentList = useSelector(selectCan('department', 'list'));
  const canEventTypeList = useSelector(selectCan('event_type', 'list'));
  const canObjectTypeList = useSelector(selectCan('object_type', 'list'));
  const visibleReferences = referencesData.filter((ref) => {
    if (ref.entity === 'department') return canDepartmentList;
    if (ref.entity === 'event_type') return canEventTypeList;
    if (ref.entity === 'object_type') return canObjectTypeList;
    return true;
  });

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  if (!canReferencesList) {
    return (
      <div className={styles.container}>
        <PageHeader title="Справочники" />
        <Card>
          <Typography.Text type="secondary">Нет доступа к разделу.</Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Справочники" />
      <div className={styles.description}>
        <Paragraph>
          Централизованное управление справочными данными системы. 
          Здесь вы можете настроить все основные классификаторы и структуры данных.
        </Paragraph>
      </div>

      <div className={styles.content}>
        <Row gutter={[24, 24]}>
          {visibleReferences.map((reference) => (
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
>>>>>>> Stashed changes
