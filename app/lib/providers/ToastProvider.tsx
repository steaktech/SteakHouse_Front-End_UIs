'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Toast, ToastContextValue, ToastProviderProps, ToastType } from '@/app/types/toast';

// Create the context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Generate unique IDs for toasts
const generateToastId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a new toast
  const showToast = useCallback((toastData: Omit<Toast, 'id' | 'timestamp' | 'isVisible'>) => {
    const id = generateToastId();
    const newToast: Toast = {
      ...toastData,
      id,
      timestamp: Date.now(),
      isVisible: true,
      duration: toastData.duration ?? defaultDuration,
    };

    setToasts(prevToasts => {
      // Add new toast and limit the number of toasts
      const updatedToasts = [newToast, ...prevToasts].slice(0, maxToasts);
      return updatedToasts;
    });

    // Auto-hide toast after duration (if not persistent)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }

    return id;
  }, [defaultDuration, maxToasts]);

  // Hide a specific toast
  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // Remove toast from array after animation completes
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 300); // Match the CSS animation duration
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts(prevToasts =>
      prevToasts.map(toast => ({ ...toast, isVisible: false }))
    );

    // Remove all toasts after animation
    setTimeout(() => {
      setToasts([]);
    }, 300);
  }, []);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      setToasts([]);
    };
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for different toast types
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    showSuccess: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'success', message, title, duration }),
    
    showError: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'error', message, title, duration }),
    
    showWarning: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'warning', message, title, duration }),
    
    showInfo: (message: string, title?: string, duration?: number) =>
      showToast({ type: 'info', message, title, duration }),
  };
};
