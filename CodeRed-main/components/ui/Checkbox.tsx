import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { clsx } from 'clsx';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  error,
  className,
  id,
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={clsx('flex items-start space-x-2', className)}>
      <CheckboxPrimitive.Root
        id={checkboxId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={clsx(
          'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white',
          'data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:text-white',
          hasError && 'border-red-300 focus-visible:ring-red-500'
        )}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${checkboxId}-error` : 
          description ? `${checkboxId}-description` : 
          undefined
        }
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {checked === 'indeterminate' ? (
            <Minus className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      
      {(label || description || error) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={checkboxId}
              className={clsx(
                'text-sm font-medium leading-none cursor-pointer',
                disabled ? 'text-gray-400' : 'text-gray-900',
                hasError && 'text-red-900'
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p 
              id={`${checkboxId}-description`}
              className={clsx(
                'text-sm',
                disabled ? 'text-gray-400' : 'text-gray-600',
                label && 'mt-1'
              )}
            >
              {description}
            </p>
          )}
          
          {error && (
            <p 
              id={`${checkboxId}-error`}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkbox;