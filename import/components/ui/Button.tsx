import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
  touchOptimized?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    className, 
    children, 
    fullWidth = false,
    touchOptimized = false,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:bg-primary/80 active:scale-95 focus:ring-primary shadow-sm hover:shadow-lg',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:bg-secondary/70 active:scale-95 focus:ring-secondary shadow-sm hover:shadow-lg',
      ghost: 'bg-transparent text-foreground hover:bg-accent hover:scale-105 active:bg-accent/80 active:scale-95 focus:ring-accent'
    };
    
    const sizeClasses = {
      sm: touchOptimized ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
      md: touchOptimized ? 'px-6 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
      lg: touchOptimized ? 'px-8 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          'touch-manipulation', // Improves touch responsiveness
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;