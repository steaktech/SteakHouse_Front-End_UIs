'use client';

import React from 'react';
import { useToast } from '@/app/lib/providers/ToastProvider';
import type { Toast, ToastType } from '@/app/types/toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

// Individual toast component
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getToastStyles = (type: ToastType): string => {
    const baseStyles = "relative flex items-start gap-3 p-4 rounded-xl border shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out";

    // Light, pastel-friendly palettes that still work in dark mode
    switch (type) {
      case 'success':
        // Soft green on light, still readable in dark
        return `${baseStyles} bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/90 dark:text-emerald-100 dark:border-emerald-600/60`;
      case 'error':
        // Custom pastel error color for light mode
        return `${baseStyles} bg-[#faa498] text-rose-950 border-rose-300 dark:bg-rose-900/90 dark:text-rose-100 dark:border-rose-600/60`;
      case 'warning':
        // Warm amber/yellow but much softer
        return `${baseStyles} bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/90 dark:text-amber-100 dark:border-amber-600/60`;
      case 'info':
        // Gentle blue info
        return `${baseStyles} bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-900/90 dark:text-sky-100 dark:border-sky-600/60`;
      default:
        return `${baseStyles} bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-600/60`;
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
      style={toast.type === 'error'
        ? (isLight
            ? {
                backgroundColor: '#faa498',
                borderColor: '#f38e82',
                color: '#4a1c18',
              }
            : {
                backgroundColor: '#8f1301',
                borderColor: '#590c01',
                color: '#ffe9e4',
              })
        : undefined}
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
