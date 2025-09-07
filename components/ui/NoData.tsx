import React from 'react';
import Button from './Button';

interface NoDataProps {
  message?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export default function NoData({ 
  message = 'No data yet', 
  description,
  action,
  icon
}: NoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-6 p-4 rounded-full bg-gray-800 border border-gray-700">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        {message}
      </h3>
      
      {description && (
        <p className="text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick}
          variant="primary"
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
