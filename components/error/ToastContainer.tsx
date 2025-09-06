'use client';

import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast, setGlobalToastHandler, type Toast } from '@/hooks/useToast';

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className,
}) => {
  const toastHandler = useToast();
  const { toasts, dismiss } = toastHandler;

  // Set global toast handler
  useEffect(() => {
    setGlobalToastHandler(toastHandler);
  }, [toastHandler]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed z-50 flex flex-col space-y-2 pointer-events-none',
        getPositionClasses(),
        className
      )}
      style={{ maxWidth: '420px', width: '100%' }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getProgressColor = () => {
    switch (toast.variant) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate progress for auto-dismiss toasts
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (toast.duration <= 0) return;

    const startTime = Date.now();
    const endTime = toast.createdAt + toast.duration;
    const totalDuration = toast.duration;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - toast.createdAt;
      const remaining = Math.max(0, totalDuration - elapsed);
      const progressPercent = (remaining / totalDuration) * 100;
      
      setProgress(progressPercent);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, [toast.createdAt, toast.duration]);

  return (
    <div
      className={clsx(
        'pointer-events-auto relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-top-full',
        getBackgroundColor()
      )}
    >
      {/* Progress bar for auto-dismiss toasts */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200">
          <div
            className={clsx('h-full transition-all duration-100 ease-linear', getProgressColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {toast.title}
              </h3>
            )}
            
            {toast.description && (
              <p className="text-sm text-gray-600">
                {toast.description}
              </p>
            )}
            
            {toast.action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toast.action.onClick}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={onDismiss}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastContainer;