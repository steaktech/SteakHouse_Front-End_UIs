'use client';

import React from 'react';
import { useToast } from '@/app/lib/providers/ToastProvider';
import type { Toast, ToastType } from '@/app/types/toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Individual toast component
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getToastStyles = (type: ToastType): string => {
    const baseStyles = "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-600/50 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-600/50 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/90 border-yellow-600/50 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-900/90 border-blue-600/50 text-blue-100`;
      default:
        return `${baseStyles} bg-gray-900/90 border-gray-600/50 text-gray-100`;
    }
  };

  const getIcon = (type: ToastType) => {
    const iconProps = { size: 20, className: "flex-shrink-0 mt-0.5" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-400`} />;
      case 'error':
        return <AlertCircle {...iconProps} className={`${iconProps.className} text-red-400`} />;
      case 'warning':
        return <AlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
      case 'info':
        return <Info {...iconProps} className={`${iconProps.className} text-blue-400`} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div
      className={`${getToastStyles(toast.type)} ${
        toast.isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95'
      }`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {getIcon(toast.type)}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold mb-1 truncate">
            {toast.title}
          </h4>
        )}
        <p className="text-sm leading-5 break-words">
          {toast.message}
        </p>
      </div>
      
      {/* Close button */}
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Main toast container component
export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="space-y-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={hideToast}
          />
        ))}
      </div>
    </div>
  );
};
