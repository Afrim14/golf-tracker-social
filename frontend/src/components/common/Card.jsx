import React, { useState } from 'react';
import { golfTheme } from '../../styles/golfTheme';

const Card = ({ 
  children, 
  hover = true, 
  className = '', 
  style = {},
  padding = 'lg',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPadding = () => {
    switch (padding) {
      case 'sm': return '12px';
      case 'md': return '16px';
      case 'lg': return '24px';
      case 'xl': return '32px';
      default: return '24px';
    }
  };

  const cardStyle = {
    background: golfTheme.gradients.card,
    borderRadius: golfTheme.borderRadius.large,
    padding: getPadding(),
    boxShadow: golfTheme.shadows.medium,
    border: `1px solid rgba(76, 175, 80, 0.1)`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...(hover && isHovered ? {
      transform: 'translateY(-4px)',
      boxShadow: golfTheme.shadows.large,
    } : {}),
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={`${className} fade-in`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
