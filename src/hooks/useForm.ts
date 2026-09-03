'use client';

import { useState, useCallback, useRef } from 'react';
import type { FormState, ValidationRule } from '@/types/common';
import { validateField, validateForm } from '@/lib/utils/validation';

interface UseFormOptions<T> {
  defaultValues: T;
  validationSchema?: Record<keyof T, ValidationRule[]>;
  onSubmit: (values: T) => Promise<void> | void;
  onError?: (error: any) => void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: (newValues?: Partial<T>) => void;
  setFormError: (error: string) => void;
  formError: string | null;
  register: (fieldName: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
}

export function useForm<T extends Record<string, any>>({
  defaultValues,
  validationSchema,
  onSubmit,
  onError,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const initialValues = useRef(defaultValues);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues.current);

  const validateFieldValue = useCallback(
    (field: keyof T, value: any): string | null => {
      if (!validationSchema?.[field]) return null;
      return validateField(value, validationSchema[field]);
    },
    [validationSchema]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Validate if field has been touched
      if (touched[field]) {
        const error = validateFieldValue(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error || undefined,
        }));
      }
    },
    [touched, validateFieldValue]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));

    if (isTouched) {
      const error = validateFieldValue(field, values[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error || undefined,
      }));
    }
  }, [values, validateFieldValue]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, type, value } = e.target as any;
      let finalValue = value;

      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        finalValue = value ? parseFloat(value) : '';
      }

      setFieldValue(name as keyof T, finalValue);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T, true);
    },
    [setFieldTouched]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormError(null);
      setIsSubmitting(true);

      try {
        // Validate all fields
        if (validationSchema) {
          const validationErrors = validateForm(values, validationSchema);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Mark all fields as touched
            const allTouched = Object.keys(values).reduce(
              (acc, key) => {
                acc[key as keyof T] = true;
                return acc;
              },
              {} as Partial<Record<keyof T, boolean>>
            );
            setTouched(allTouched);
            setIsSubmitting(false);
            return;
          }
        }

        await onSubmit(values);
        // Reset form on successful submission
        setValues(defaultValues);
        setErrors({});
        setTouched({});
      } catch (error) {
        const err = error as any;
        setFormError(
          err.message ||
            (typeof error === 'string' ? error : 'An error occurred')
        );
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validationSchema, onSubmit, onError, defaultValues]
  );

  const resetForm = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues
      ? { ...defaultValues, ...newValues }
      : defaultValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setFormError(null);
    initialValues.current = resetValues;
  }, [defaultValues]);

  const register = useCallback(
    (fieldName: keyof T) => ({
      value: values[fieldName],
      onChange: handleChange,
      onBlur: handleBlur,
      name: String(fieldName),
    }),
    [values, handleChange, handleBlur]
  );

  const isValid =
    Object.keys(errors).length === 0 &&
    (!validationSchema ||
      Object.keys(validationSchema).every(
        (field) => !validateFieldValue(field as keyof T, values[field as keyof T])
      ));

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormError,
    formError,
    register,
  };
}
