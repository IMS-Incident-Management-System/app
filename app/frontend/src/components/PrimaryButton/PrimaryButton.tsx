import React from 'react';
import { Button, ButtonProps } from 'antd';
import styles from './PrimaryButton.module.scss';

interface PrimaryButtonProps extends Omit<ButtonProps, 'type' | 'variant'> {
  variant?: 'primary' | 'secondary';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  variant = 'primary',
  className = '',
  children,
  ...props 
}) => {
  const buttonClassName = variant === 'primary' 
    ? `${styles.primaryButton} ${className}`
    : `${styles.secondaryButton} ${className}`;

  return (
    <Button
      className={buttonClassName}
      {...props}
    >
      {children}
    </Button>
  );
};
