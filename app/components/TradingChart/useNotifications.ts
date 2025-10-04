"use client";

import { useState, useCallback } from 'react';
import { OrderNotification } from './types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  const addNotification = useCallback((notification: Omit<OrderNotification, 'id' | 'timestamp'>) => {
    const newNotification: OrderNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const notifySuccess = useCallback((title: string, message: string, orderId?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      orderId,
      autoClose: true,
      duration: 4000
    });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string, orderId?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      orderId,
      autoClose: true,
      duration: 6000
    });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, orderId?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      orderId,
      autoClose: true,
      duration: 5000
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, orderId?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      orderId,
      autoClose: true,
      duration: 4000
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};