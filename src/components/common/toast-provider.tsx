'use client';

import React, { ReactNode } from 'react';
import { ToastContext, useToastProvider } from '@/hooks/useToast';
import type { Toast, NotificationType } from '@/types/common';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toastMethods = useToastProvider();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer toasts={toastMethods.toasts} onClose={toastMethods.removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: () => void;
}

function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const bgColors: Record<NotificationType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const textColors: Record<NotificationType, string> = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  const iconColors: Record<NotificationType, string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  const icons: Record<NotificationType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`border rounded-md p-4 flex items-start gap-3 ${bgColors[toast.type]}`}
      role="alert"
    >
      <span className={`text-lg font-bold ${iconColors[toast.type]} flex-shrink-0`}>
        {icons[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-medium ${textColors[toast.type]}`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm ${textColors[toast.type]}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`text-${toast.type === 'success' ? 'green' : toast.type === 'error' ? 'red' : toast.type === 'info' ? 'blue' : 'yellow'}-600 hover:text-${toast.type === 'success' ? 'green' : toast.type === 'error' ? 'red' : toast.type === 'info' ? 'blue' : 'yellow'}-700 flex-shrink-0 text-lg`}
      >
        ×
      </button>
    </div>
  );
}
