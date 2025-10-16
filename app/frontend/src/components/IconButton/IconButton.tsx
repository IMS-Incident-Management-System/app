import React from 'react';
import { Button, ButtonProps, Tooltip } from 'antd';
import styles from './IconButton.module.scss';

export type IconButtonVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
export type IconButtonStyle = 'solid' | 'glass' | 'minimal';

interface IconButtonProps extends Omit<ButtonProps, 'type' | 'shape' | 'variant'> {
  variant?: IconButtonVariant;
  buttonStyle?: IconButtonStyle;
  tooltip?: string;
}

const variantColors = {
  primary: {
    color: '#1890ff',
    shadow: 'rgba(24, 144, 255, 0.2)',
  },
  success: {
    color: '#52c41a',
    shadow: 'rgba(82, 196, 26, 0.2)',
  },
  danger: {
    color: '#ff4d4f',
    shadow: 'rgba(255, 77, 79, 0.2)',
  },
  warning: {
    color: '#faad14',
    shadow: 'rgba(250, 173, 20, 0.2)',
  },
  info: {
    color: '#13c2c2',
    shadow: 'rgba(19, 194, 194, 0.2)',
  },
  default: {
    color: '#8c8c8c',
    shadow: 'rgba(140, 140, 140, 0.2)',
  },
};

export const IconButton: React.FC<IconButtonProps> = ({ 
  variant = 'default', 
  buttonStyle = 'minimal',
  tooltip,
  className = '',
  ...props 
}) => {
  const colors = variantColors[variant];
  
  let buttonClassName = styles.iconButton;
  let buttonStyle_inline = {};
  
  if (buttonStyle === 'glass') {
    buttonClassName += ` ${styles.iconButtonGlass}`;
    buttonStyle_inline = {
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };
  } else if (buttonStyle === 'minimal') {
    buttonClassName += ` ${styles.iconButtonMinimal}`;
    buttonStyle_inline = {
      color: '#262626',
      border: '1px solid #d9d9d9',
      background: '#ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    };
  } else {
    buttonClassName += ` ${styles.iconButtonSolid}`;
    buttonStyle_inline = {
      color: colors.color,
      border: `1px solid ${colors.color}`,
      background: '#ffffff',
      boxShadow: `0 2px 4px ${colors.shadow}`,
    };
  }
  
  buttonClassName += ` ${className}`;
  
  const button = (
    <Button
      type="text"
      shape="circle"
      size="middle"
      className={buttonClassName}
      style={buttonStyle_inline}
      {...props}
    />
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};
