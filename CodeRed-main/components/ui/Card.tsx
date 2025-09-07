import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick,
}) => {
  const baseClasses = 'bg-card rounded-lg transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const borderClasses = border ? 'border border-border' : '';
  const hoverClasses = hover ? 'card-hover hover:shadow-lg hover:border-border/80' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={clsx(
        baseClasses,
        paddingClasses[padding],
        shadowClasses[shadow],
        borderClasses,
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card sub-components for composition
export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('mb-4', className)}>
    {children}
  </div>
);

export const CardBody: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('mb-4', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <div className={clsx('pt-4 border-t border-border', className)}>
    {children}
  </div>
);

export default Card;