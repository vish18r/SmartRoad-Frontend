export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
  cursor?: string;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SearchParams extends FilterParams, SortParams, PaginationParams {
  search?: string;
  organizationId?: string;
  projectId?: string;
  workspaceId?: string;
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SITE_ENGINEER = 'SITE_ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  WORKER = 'WORKER',
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER',
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  status?: StatusEnum;
}

export interface NamedEntity extends BaseEntity {
  name: string;
}

export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  workspaceId?: string;
  userId?: string;
  userRole?: RoleEnum;
}

export interface TableColumn<T> {
  id: string;
  label: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: number | string | RegExp | ((val: any) => boolean);
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[]; // MIME types
  maxFiles?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Toast {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: () => void;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface CurrencyFormat {
  amount: number;
  currency: string;
  locale?: string;
}
