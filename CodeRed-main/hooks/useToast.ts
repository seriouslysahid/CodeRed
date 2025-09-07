'use client';

import { useState, useCallback, useRef } from 'react';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export interface Toast extends Required<Omit<ToastOptions, 'action' | 'onDismiss'>> {
  id: string;
  createdAt: number;
  action?: ToastOptions['action'];
  onDismiss?: ToastOptions['onDismiss'];
}

const DEFAULT_DURATION = 5000;

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = useCallback(() => {
    return `toast-${++toastCounter}-${Date.now()}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = options.id || generateId();
    const duration = options.duration ?? DEFAULT_DURATION;
    
    const toast: Toast = {
      id,
      title: options.title || '',
      description: options.description || '',
      variant: options.variant || 'default',
      duration,
      createdAt: Date.now(),
      action: options.action,
      onDismiss: options.onDismiss,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration (if duration > 0)
    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
        options.onDismiss?.();
      }, duration);
      
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [generateId, removeToast]);

  const dismissToast = useCallback((id: string) => {
    const toast = toasts.find(t => t.id === id);
    removeToast(id);
    toast?.onDismiss?.();
  }, [toasts, removeToast]);

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    // Call onDismiss for all toasts
    toasts.forEach(toast => toast.onDismiss?.());
    
    setToasts([]);
  }, [toasts]);

  // Convenience methods
  const toast = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, [addToast]);

  const success = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>) => {
    return addToast({
      ...options,
      title,
      description,
      variant: 'success',
    });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>) => {
    return addToast({
      ...options,
      title,
      description,
      variant: 'error',
      duration: options?.duration ?? 8000, // Longer duration for errors
    });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>) => {
    return addToast({
      ...options,
      title,
      description,
      variant: 'warning',
    });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>) => {
    return addToast({
      ...options,
      title,
      description,
      variant: 'info',
    });
  }, [addToast]);

  // Promise-based toast for async operations
  const promise = useCallback(<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    const loadingId = addToast({
      title: options.loading,
      variant: 'info',
      duration: 0, // Don't auto-dismiss
    });

    return promise
      .then((data) => {
        removeToast(loadingId);
        const successMessage = typeof options.success === 'function' 
          ? options.success(data) 
          : options.success;
        success(successMessage);
        return data;
      })
      .catch((err) => {
        removeToast(loadingId);
        const errorMessage = typeof options.error === 'function' 
          ? options.error(err) 
          : options.error;
        error(errorMessage);
        throw err;
      });
  }, [addToast, removeToast, success, error]);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    promise,
    dismiss: dismissToast,
    clear: clearAllToasts,
  };
}

// Global toast context for use across the app
let globalToastHandler: ReturnType<typeof useToast> | null = null;

export function setGlobalToastHandler(handler: ReturnType<typeof useToast>) {
  globalToastHandler = handler;
}

export function getGlobalToast() {
  if (!globalToastHandler) {
    console.warn('Global toast handler not initialized. Make sure to call setGlobalToastHandler in your app root.');
    return {
      toast: () => '',
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
      promise: (p: Promise<any>) => p,
      dismiss: () => {},
      clear: () => {},
    };
  }
  return globalToastHandler;
}

// Utility functions for common toast patterns
export const toastUtils = {
  networkError: () => {
    getGlobalToast().error(
      'Network Error',
      'Please check your internet connection and try again.'
    );
  },
  
  rateLimitError: (retryAfter?: number) => {
    getGlobalToast().warning(
      'Rate Limited',
      retryAfter 
        ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
        : 'Too many requests. Please wait a moment before trying again.'
    );
  },
  
  serverError: () => {
    getGlobalToast().error(
      'Server Error',
      'Something went wrong on our end. Please try again later.'
    );
  },
  
  validationError: (message?: string) => {
    getGlobalToast().error(
      'Validation Error',
      message || 'Please check your input and try again.'
    );
  },
  
  saveSuccess: (itemName = 'Item') => {
    getGlobalToast().success(
      'Saved Successfully',
      `${itemName} has been saved successfully.`
    );
  },
  
  deleteSuccess: (itemName = 'Item') => {
    getGlobalToast().success(
      'Deleted Successfully',
      `${itemName} has been deleted successfully.`
    );
  },
  
  copySuccess: () => {
    getGlobalToast().success(
      'Copied to Clipboard',
      'The content has been copied to your clipboard.'
    );
  },
};