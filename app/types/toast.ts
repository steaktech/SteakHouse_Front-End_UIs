// types/toast.ts

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // in milliseconds, null for persistent
  isVisible?: boolean;
  timestamp: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id' | 'timestamp' | 'isVisible'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}
