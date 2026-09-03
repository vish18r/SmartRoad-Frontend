import type { ValidationRule } from '@/types/common';

export const validators = {
  required: (value: any, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (value: string, message = 'Invalid email address') => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },

  phone: (value: string, message = 'Invalid phone number') => {
    if (!value) return null;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(value) ? null : message;
  },

  url: (value: string, message = 'Invalid URL') => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  minLength: (value: any, minLength: number, message?: string) => {
    if (!value) return null;
    const len = typeof value === 'string' ? value.length : (value as any[]).length;
    return len >= minLength
      ? null
      : message || `Minimum length is ${minLength}`;
  },

  maxLength: (value: any, maxLength: number, message?: string) => {
    if (!value) return null;
    const len = typeof value === 'string' ? value.length : (value as any[]).length;
    return len <= maxLength
      ? null
      : message || `Maximum length is ${maxLength}`;
  },

  min: (value: number, min: number, message?: string) => {
    if (value === null || value === undefined) return null;
    return value >= min ? null : message || `Minimum value is ${min}`;
  },

  max: (value: number, max: number, message?: string) => {
    if (value === null || value === undefined) return null;
    return value <= max ? null : message || `Maximum value is ${max}`;
  },

  pattern: (value: string, pattern: RegExp, message = 'Invalid format') => {
    if (!value) return null;
    return pattern.test(value) ? null : message;
  },

  custom: (value: any, validator: (val: any) => boolean, message = 'Invalid value') => {
    return validator(value) ? null : message;
  },

  matchField: (value: string, fieldValue: string, message = 'Fields do not match') => {
    return value === fieldValue ? null : message;
  },

  date: (value: any, message = 'Invalid date') => {
    if (!value) return null;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) ? null : message;
  },

  dateRange: (
    value: any,
    minDate?: Date,
    maxDate?: Date,
    message?: string
  ) => {
    if (!value) return null;
    const date = new Date(value);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return message || 'Invalid date';
    }
    if (minDate && date < minDate) {
      return message || `Date must be after ${minDate.toDateString()}`;
    }
    if (maxDate && date > maxDate) {
      return message || `Date must be before ${maxDate.toDateString()}`;
    }
    return null;
  },

  creditCard: (value: string, message = 'Invalid credit card number') => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return message;
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0 ? null : message;
  },
};

export function validateField(
  value: any,
  rules: ValidationRule[]
): string | null {
  for (const rule of rules) {
    let error: string | null = null;

    switch (rule.type) {
      case 'required':
        error = validators.required(value, rule.message);
        break;
      case 'email':
        error = validators.email(value, rule.message);
        break;
      case 'phone':
        error = validators.phone(value, rule.message);
        break;
      case 'url':
        error = validators.url(value, rule.message);
        break;
      case 'minLength':
        error = validators.minLength(value, rule.value as number, rule.message);
        break;
      case 'maxLength':
        error = validators.maxLength(value, rule.value as number, rule.message);
        break;
      case 'min':
        error = validators.min(value, rule.value as number, rule.message);
        break;
      case 'max':
        error = validators.max(value, rule.value as number, rule.message);
        break;
      case 'pattern':
        error = validators.pattern(value, rule.value as RegExp, rule.message);
        break;
      case 'custom':
        error = validators.custom(value, rule.value as (val: any) => boolean, rule.message);
        break;
    }

    if (error) {
      return error;
    }
  }

  return null;
}

export function validateForm<T extends Record<string, any>>(
  values: T,
  schema: Record<keyof T, ValidationRule[]>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in schema) {
    const error = validateField(values[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}
