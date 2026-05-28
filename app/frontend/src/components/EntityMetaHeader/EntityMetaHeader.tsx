import React from 'react';
import dayjs from 'dayjs';
import { EntityMeta } from '../../interfaces/activity';
import styles from './EntityMetaHeader.module.scss';

interface EntityMetaHeaderProps {
  meta?: EntityMeta | null;
}

function formatUser(name: string | null | undefined): string {
  if (name && name.trim()) return name.trim();
  return 'Неизвестный пользователь';
}

export const EntityMetaHeader: React.FC<EntityMetaHeaderProps> = ({ meta }) => {
  if (!meta) return null;

  const createdName = formatUser(
    meta.created_by_user?.display_name ?? meta.created_by_user?.preferred_username
  );
  const updatedName = formatUser(
    meta.updated_by_user?.display_name ?? meta.updated_by_user?.preferred_username
  );

  const createdAt = meta.created_at
    ? dayjs(meta.created_at).format('DD.MM.YYYY HH:mm')
    : '—';
  const updatedAt = meta.updated_at
    ? dayjs(meta.updated_at).format('DD.MM.YYYY HH:mm')
    : '—';

  return (
    <div className={styles.meta}>
      <div className={styles.row}>
        <span>
          <span className={styles.label}>Создал: </span>
          <span className={styles.name}>{createdName}</span>
          <span className={styles.label}> · {createdAt}</span>
        </span>
        <span>
          <span className={styles.label}>Изменил: </span>
          <span className={styles.name}>{updatedName}</span>
          <span className={styles.label}> · {updatedAt}</span>
        </span>
      </div>
    </div>
  );
};
