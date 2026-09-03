'use client';

import React, { ReactNode } from 'react';
import type { SelectOption } from '@/types/common';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  helperText,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    { label, error, helperText, required, className = '', ...props },
    ref
  ) => {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-blue-500'
          } ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);
FormInput.displayName = 'FormInput';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    { label, error, helperText, required, className = '', ...props },
    ref
  ) => {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-blue-500'
          } ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);
FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  FormSelectProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      options = [],
      placeholder,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <FormField label={label} error={error} helperText={helperText} required={required}>
        <select
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error
              ? 'border-red-500 focus:outline-none focus:ring-red-500'
              : 'border-gray-300 focus:outline-none focus:ring-blue-500'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);
FormSelect.displayName = 'FormSelect';

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  FormCheckboxProps
>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <FormField error={error} helperText={helperText}>
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 ${className}`}
            {...props}
          />
          {label && (
            <label className="ml-2 text-sm text-gray-700">{label}</label>
          )}
        </div>
      </FormField>
    );
  }
);
FormCheckbox.displayName = 'FormCheckbox';

interface FormRadioGroupProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export function FormRadioGroup({
  label,
  error,
  helperText,
  required,
  options,
  value,
  onChange,
}: FormRadioGroupProps) {
  return (
    <FormField label={label} error={error} helperText={helperText} required={required}>
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center">
            <input
              type="radio"
              id={`radio-${opt.value}`}
              name="radio-group"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value as string)}
              disabled={opt.disabled}
              className="h-4 w-4 border-gray-300 text-blue-600"
            />
            <label htmlFor={`radio-${opt.value}`} className="ml-2 text-sm text-gray-700">
              {opt.label}
            </label>
          </div>
        ))}
      </div>
    </FormField>
  );
}

interface FormErrorProps {
  message?: string;
  errors?: Record<string, string>;
}

export function FormError({ message, errors }: FormErrorProps) {
  if (!message && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      {message && <p className="text-sm text-red-800 font-medium">{message}</p>}
      {errors && Object.entries(errors).length > 0 && (
        <ul className="mt-2 space-y-1">
          {Object.entries(errors).map(([field, error]) => (
            <li key={field} className="text-sm text-red-700">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FormSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function FormSubmitButton({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  className = '',
  ...props
}: FormSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export function Form({ children, className = '', ...props }: FormProps) {
  return (
    <form className={`space-y-6 ${className}`} {...props}>
      {children}
    </form>
  );
}
