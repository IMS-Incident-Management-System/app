import React from 'react';
import { Spin, Timeline } from 'antd';
import {
  PaperClipOutlined,
  PlusCircleOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEntityActivity } from '../../services/requests/activity/useEntityActivity';
import { ActivityCategory, EntityActivityResource } from '../../interfaces/activity';
import { groupActivitiesByDay } from '../../utils/groupActivitiesByDay';
import styles from './EntityActivityTimeline.module.scss';

interface EntityActivityTimelineProps {
  resource: EntityActivityResource;
  entityId: string | number | undefined;
}

function categoryIcon(category: ActivityCategory) {
  switch (category) {
    case 'attachment':
      return <PaperClipOutlined />;
    case 'relation':
      return <LinkOutlined />;
    default:
      return <EditOutlined />;
  }
}

function categoryColor(category: ActivityCategory): string {
  switch (category) {
    case 'attachment':
      return 'blue';
    case 'relation':
      return 'purple';
    default:
      return 'green';
  }
}

export const EntityActivityTimeline: React.FC<EntityActivityTimelineProps> = ({
  resource,
  entityId,
}) => {
  const { data, isLoading, isError } = useEntityActivity(resource, entityId);
  const activities = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <Spin />
      </div>
    );
  }

  if (isError) {
    return <div className={styles.empty}>Не удалось загрузить историю изменений</div>;
  }

  if (!activities.length) {
    return <div className={styles.empty}>История изменений пока пуста</div>;
  }

  const groups = groupActivitiesByDay(activities);

  return (
    <div className={styles.wrapper}>
      {groups.map((group) => (
        <div key={group.label} className={styles.dayGroup}>
          <div className={styles.dayLabel}>{group.label}</div>
          <Timeline
            items={group.items.map((item) => {
              const actorName =
                item.actor?.display_name ||
                item.actor?.preferred_username ||
                'Система';
              const isHigh = item.importance === 'high';
              return {
                dot: item.activity_type === 'created' ? <PlusCircleOutlined /> : categoryIcon(item.category),
                color: item.activity_type === 'created' ? 'green' : categoryColor(item.category),
                children: (
                  <div>
                    <div
                      className={`${styles.summary} ${isHigh ? styles.summaryHigh : ''}`}
                    >
                      {item.summary}
                    </div>
                    <div className={styles.meta}>
                      {actorName} · {dayjs(item.occurred_at).format('HH:mm')}
                    </div>
                  </div>
                ),
              };
            })}
          />
        </div>
      ))}
    </div>
  );
};
