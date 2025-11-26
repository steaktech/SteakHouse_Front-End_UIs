"use client";

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { OrderNotification as OrderNotificationType } from './types';

interface OrderNotificationProps {
  notification: OrderNotificationType;
  onClose: () => void;
}

export const OrderNotification: React.FC<OrderNotificationProps> = ({ notification, onClose }) => {
  const { type, title, message, autoClose = true, duration = 5000 } = notification;

  // Auto-close notification
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(180deg, rgba(0, 208, 138, 0.15), rgba(0, 208, 138, 0.15))',
          border: 'rgba(0, 208, 138, 0.4)',
          icon: '#00D08A',
          title: '#00D08A',
          text: '#bbf7d0'
        };
      case 'error':
        return {
          bg: 'linear-gradient(180deg, rgba(255, 77, 77, 0.15), rgba(255, 77, 77, 0.15))',
          border: 'rgba(255, 77, 77, 0.4)',
          icon: '#FF4D4D',
          title: '#FF4D4D',
          text: '#fecaca'
        };
      case 'warning':
        return {
          bg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15))',
          border: 'rgba(245, 158, 11, 0.4)',
          icon: '#f59e0b',
          title: '#d97706',
          text: '#fed7aa'
        };
      case 'info':
      default:
        return {
          bg: 'linear-gradient(180deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
          border: 'rgba(59, 130, 246, 0.4)',
          icon: '#3b82f6',
          title: '#2563eb',
          text: '#bfdbfe'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        minWidth: '320px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ color: colors.icon, flexShrink: 0, marginTop: '2px' }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 700,
            color: colors.title,
            fontFamily: '"Sora", "Inter", sans-serif'
          }}>
            {title}
          </h4>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: colors.text,
            lineHeight: 1.4,
            opacity: 0.9
          }}>
            {message}
          </p>
          {notification.orderId && (
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '11px',
              color: colors.text,
              opacity: 0.7,
              fontFamily: 'monospace'
            }}>
              Order ID: {notification.orderId}
            </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            width: '100%',
            background: colors.border,
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: colors.icon,
              transformOrigin: 'left',
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );
};