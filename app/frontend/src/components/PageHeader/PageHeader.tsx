import React from 'react';
import { Button } from 'antd';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  actions, 
  className = '' 
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <h2 className={styles.title}>{title}</h2>
      {actions && (
        <div className={styles.headerActions}>
          {actions}
        </div>
      )}
    </div>
  );
};




