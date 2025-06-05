import React, { useState } from 'react';
import { golfTheme } from '../../styles/golfTheme';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getButtonStyle = () => {
    const baseStyle = {
      background: golfTheme.gradients.fairway,
      border: 'none',
      borderRadius: '25px',
      padding: '12px 24px',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: golfTheme.shadows.button,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
    };

    if (isHovered && !disabled) {
      baseStyle.transform = 'translateY(-2px)';
      baseStyle.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
    }

    if (variant === 'secondary') {
      baseStyle.background = golfTheme.gradients.card;
      baseStyle.color = golfTheme.colors.primary;
      baseStyle.border = `2px solid ${golfTheme.colors.primary}`;
    }

    if (variant === 'danger') {
      baseStyle.background = 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)';
      baseStyle.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)';
    }

    if (variant === 'achievement') {
      baseStyle.background = golfTheme.gradients.achievement;
      baseStyle.color = golfTheme.colors.primary;
    }

    if (size === 'small') {
      baseStyle.padding = '8px 16px';
      baseStyle.fontSize = '12px';
    }

    if (size === 'large') {
      baseStyle.padding = '16px 32px';
      baseStyle.fontSize = '16px';
    }

    if (disabled) {
      baseStyle.opacity = '0.5';
      baseStyle.cursor = 'not-allowed';
      baseStyle.transform = 'none';
    }

    return { ...baseStyle, ...style };
  };

  return (
    <button
      type={type}
      style={getButtonStyle()}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
