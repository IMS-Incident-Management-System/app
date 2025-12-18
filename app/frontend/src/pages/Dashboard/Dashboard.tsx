import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  NotificationOutlined, 
  CalendarOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ERoutes } from '../../enums/routes';
import styles from './Dashboard.module.scss';

const { Title, Paragraph } = Typography;

interface DashboardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const dashboardData: DashboardItem[] = [
  {
    id: 'incidents',
    title: 'Инциденты',
    description: 'Управление инцидентами безопасности. Создание, редактирование и отслеживание инцидентов различных направлений: ИБ, ЭБ, БПиО.',
    icon: <NotificationOutlined />,
    route: ERoutes.INCIDENTS_LIST,
    color: '#1890ff'
  },
  {
    id: 'operational-activities',
    title: 'Операционная деятельность',
    description: 'Регистрация операционной деятельности по направлениям безопасности. Отчетность по работе подразделений безопасности за определенный период.',
    icon: <CalendarOutlined />,
    route: ERoutes.OPERATIONAL_ACTIVITIES_LIST,
    color: '#52c41a'
  }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Row gutter={[24, 24]} justify="center">
          {dashboardData.map((item) => (
            <Col xs={24} sm={24} md={12} lg={10} key={item.id}>
              <Card
                className={styles.dashboardCard}
                hoverable
                onClick={() => handleNavigate(item.route)}
                style={{ borderLeft: `4px solid ${item.color}` }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div 
                      className={styles.iconWrapper}
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div
                      className={styles.arrowWrapper}
                      style={{ color: item.color }}
                    >
                      <RightOutlined />
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <Title level={3} className={styles.cardTitle}>
                      {item.title}
                    </Title>
                    <Paragraph className={styles.cardDescription}>
                      {item.description}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;

