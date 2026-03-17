import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileTextOutlined, RightOutlined, TableOutlined } from '@ant-design/icons';
import { ERoutes } from '../../enums/routes';
import styles from './Reports.module.scss';
import { PageHeader } from '../../components/PageHeader';
import { selectCanReportGenerate, selectCanReportTable, selectCan } from '../../store/features/permissions/selectors';

const { Title, Paragraph } = Typography;

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  /** Показывать карточку только если есть хотя бы одно из прав */
  permissionCheck?: (state: { canGenerate: boolean; canTable: boolean; canListNote: boolean }) => boolean;
}

const reportsData: ReportItem[] = [
  {
    id: 'report-generator',
    title: 'Генератор отчетности',
    description: 'Создание и выгрузка отчетов по инцидентам, событиям и операционной деятельности с возможностью фильтрации по периодам и департаментам.',
    icon: <FileTextOutlined />,
    route: ERoutes.REPORTS + '/generator',
    color: '#1890ff',
    permissionCheck: (p) => p.canGenerate || p.canTable,
  },
  {
    id: 'explanatory-notes',
    title: 'Пояснительная записка',
    description: 'Реестр пояснительной записки к отчету по форме 2-ДБ по Группе МТС с возможностью фильтрации по периодам.',
    icon: <TableOutlined />,
    route: ERoutes.EXPLANATORY_NOTES_LIST,
    color: '#52c41a',
    permissionCheck: (p) => p.canListNote,
  }
];

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const canGenerate = useSelector(selectCanReportGenerate);
  const canTable = useSelector(selectCanReportTable);
  const canListNote = useSelector(selectCan('explanatory_note', 'list'));
  const permissionState = { canGenerate, canTable, canListNote };

  const visibleReports = reportsData.filter(
    (r) => !r.permissionCheck || r.permissionCheck(permissionState)
  );

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Отчетность" />
      <div className={styles.description}>
        <Paragraph>
          Генерация и выгрузка отчетов по различным аспектам деятельности службы безопасности.
          Выберите тип отчета для создания.
        </Paragraph>
      </div>

      <div className={styles.content}>
        <Row gutter={[24, 24]}>
          {visibleReports.map((report) => (
            <Col xs={24} sm={12} lg={8} key={report.id}>
              <Card
                className={styles.reportCard}
                hoverable
                onClick={() => handleNavigate(report.route)}
                style={{ 
                  '--card-color': report.color,
                  '--card-color-dark': report.color + 'dd'
                } as React.CSSProperties}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div 
                      className={styles.iconWrapper}
                      style={{ 
                        background: `linear-gradient(135deg, ${report.color}10 0%, ${report.color}25 100%)`,
                      }}
                    >
                      {report.icon}
                    </div>
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      className={styles.arrowButton}
                    />
                  </div>
                  
                  <div className={styles.cardBody}>
                    <Title level={4} className={styles.cardTitle}>
                      {report.title}
                    </Title>
                    <Paragraph className={styles.cardDescription}>
                      {report.description}
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
