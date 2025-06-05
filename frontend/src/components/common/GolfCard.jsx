import React, { useState } from 'react';
import { golfTheme } from '../../styles/golfTheme';

const GolfCard = ({ 
  children, 
  hover = true, 
  className = '', 
  style = {},
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    background: golfTheme.gradients.card,
    borderRadius: golfTheme.borderRadius.large,
    padding: golfTheme.spacing.lg,
    boxShadow: golfTheme.shadows.large,
    border: `1px solid rgba(76, 175, 80, 0.1)`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    ...(hover && isHovered ? {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(45, 90, 39, 0.15)',
    } : {}),
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default GolfCard;
