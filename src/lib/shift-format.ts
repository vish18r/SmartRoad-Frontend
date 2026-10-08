// Shared display helpers and label/color maps for the shift management module, so the
// dashboard, list, form and details pages present shift and assignment status consistently
// instead of each re-declaring its own copy. Reuses formatDate from payroll-format rather than
// redefining the same yyyy-MM-dd formatting here.
import { formatDate } from '@/lib/payroll-format';

export const SHIFT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const SHIFT_STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-600',
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  ended: 'Ended',
};

export const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-600',
  ended: 'bg-amber-100 text-amber-700',
};

/** "08:00 AM" from a "HH:mm" or "HH:mm:ss" time string, or an em dash when absent. */
export function formatTime(time?: string): string {
  if (!time) return '—';
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelveHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/** "8h 30m" from a count of minutes, or "—" when absent. Zero renders as "0h". */
export function formatWorkingMinutes(minutes?: number): string {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) return '—';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Client-side-only preview of the backend's overnight-aware working-minutes calculation, shown
 * live while filling out the shift form. The backend value returned on save is always the source
 * of truth; this is never submitted to the API.
 */
export function previewWorkingMinutes(startTime: string, endTime: string, breakDurationMinutes: number): number | null {
  if (!startTime || !endTime) return null;
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  if ([startHours, startMinutes, endHours, endMinutes].some((value) => Number.isNaN(value))) return null;

  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  if (startTotal === endTotal) return null;

  let rawMinutes = endTotal - startTotal;
  if (rawMinutes < 0) rawMinutes += 24 * 60;

  const breakMinutes = Number.isFinite(breakDurationMinutes) ? breakDurationMinutes : 0;
  return Math.max(0, rawMinutes - breakMinutes);
}

/**
 * "08-Oct-2026 → 15-Nov-2026, Shift Name" or "08-Oct-2026 → Current, Shift Name" for a worker's
 * shift assignment history entry.
 */
export function formatAssignmentHistoryEntry(effectiveFrom: string, effectiveTo: string | undefined, shiftName?: string): string {
  const range = `${formatDate(effectiveFrom)} → ${effectiveTo ? formatDate(effectiveTo) : 'Current'}`;
  return shiftName ? `${range}, ${shiftName}` : range;
}
