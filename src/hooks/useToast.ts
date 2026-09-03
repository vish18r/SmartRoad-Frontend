'use client';

import { useCallback, useContext, createContext, useState, ReactNode } from 'react';
import type { Toast, NotificationType } from '@/types/common';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function useToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      if (toast.duration !== 0 && toast.duration !== undefined && toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration || 5000);
      }

      return id;
    },
    [removeToast]
  );

  const createToast = useCallback(
    (type: NotificationType, message: string, title?: string, duration?: number) => {
      return addToast({ type, message, title, duration });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success: (message, title, duration) =>
      createToast('success', message, title, duration),
    error: (message, title, duration) =>
      createToast('error', message, title, duration),
    info: (message, title, duration) =>
      createToast('info', message, title, duration),
    warning: (message, title, duration) =>
      createToast('warning', message, title, duration),
  };
}
