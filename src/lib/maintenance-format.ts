// Shared display helpers, option lists and label/color maps for the maintenance module, so the
// list page, detail page, calendar and dialogs present maintenance data consistently instead of
// each re-declaring its own copy.
import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceRecurrence,
  MaintenanceStatus,
  MaintenanceType,
} from '@/types/maintenance';

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: 'Scheduled',
  due: 'Due',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const MAINTENANCE_STATUS_STYLES: Record<MaintenanceStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  due: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const MAINTENANCE_PRIORITY_STYLES: Record<MaintenancePriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  preventive: 'Preventive',
  corrective: 'Corrective',
};

export const MAINTENANCE_CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  scheduled_servicing: 'Scheduled servicing',
  oil_filter_change: 'Oil / filter change',
  routine_inspection: 'Routine inspection',
  lubrication: 'Lubrication',
  scheduled_part_replacement: 'Scheduled part replacement',
  breakdown: 'Unexpected breakdown',
  equipment_repair: 'Equipment repair',
  fault_diagnosis: 'Fault diagnosis',
  part_replacement: 'Part replacement',
  emergency_maintenance: 'Emergency maintenance',
  other: 'Other',
};

// Categories allowed per type; mirrors MaintenanceCategoryEnum#isAllowedFor on the server.
export const CATEGORIES_BY_TYPE: Record<MaintenanceType, MaintenanceCategory[]> = {
  preventive: ['scheduled_servicing', 'oil_filter_change', 'routine_inspection', 'lubrication', 'scheduled_part_replacement', 'other'],
  corrective: ['breakdown', 'equipment_repair', 'fault_diagnosis', 'part_replacement', 'emergency_maintenance', 'other'],
};

export const MAINTENANCE_RECURRENCE_LABELS: Record<MaintenanceRecurrence, string> = {
  one_time: 'One time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const MAINTENANCE_STATUS_OPTIONS: MaintenanceStatus[] = ['scheduled', 'due', 'overdue', 'in_progress', 'completed', 'cancelled'];
export const MAINTENANCE_PRIORITY_OPTIONS: MaintenancePriority[] = ['low', 'medium', 'high', 'critical'];

/** "2026-10-28" for a Date, in local time. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Value for an <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") from an ISO timestamp or Date, in local time. */
export function toDateTimeLocalValue(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${toIsoDate(date)}T${hours}:${minutes}`;
}

/**
 * ISO-8601 timestamp with the browser's local UTC offset (e.g. "2026-10-28T09:30:00+05:30") from a
 * datetime-local value. The offset matters: when no scheduled end is given the server derives the
 * "due by" deadline as the end of the scheduled start's day in the offset supplied.
 */
export function toOffsetIso(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return undefined;
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${toDateTimeLocalValue(date)}:${seconds}${offset}`;
}

/** "28 Oct 2026, 09:30" from an ISO timestamp, or an em dash when absent. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "28 Oct 2026" from an ISO timestamp, or an em dash when absent. */
export function formatDay(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "2 h 15 min" from minutes; "Not recorded" when null (never an invented 0). */
export function formatDowntime(minutes?: number | null): string {
  if (minutes === null || minutes === undefined) return 'Not recorded';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest ? `${hours} h ${rest} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days} d${remHours ? ` ${remHours} h` : ''}${rest ? ` ${rest} min` : ''}`;
}

/** Human label for an enum-ish value missing from a label map ("in_progress" -> "In progress"). */
export function humanize(value?: string | null): string {
  if (!value) return '—';
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
