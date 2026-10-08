// Shared display helpers and label/color maps for the payroll module, so the dashboard, list,
// create and details pages present payroll status, wage type, allowance type and deduction type
// consistently instead of each re-declaring its own copy.

export const PAYROLL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  processed: 'Processed',
  approved: 'Approved',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const PAYROLL_STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  processed: 'bg-blue-100 text-blue-700',
  approved: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const WAGE_TYPE_LABELS: Record<string, string> = {
  daily: 'Daily',
  monthly: 'Monthly',
};

export const ALLOWANCE_TYPE_LABELS: Record<string, string> = {
  travel: 'Travel',
  food: 'Food',
  accommodation: 'Accommodation',
  site: 'Site',
  performance: 'Performance',
  other: 'Other',
};

export const DEDUCTION_TYPE_LABELS: Record<string, string> = {
  salary_advance: 'Salary advance',
  loan_deduction: 'Loan deduction',
  late_deduction: 'Late deduction',
  absence_deduction: 'Absence deduction',
  other_deduction: 'Other deduction',
};

/** "06 Oct 2026" from a yyyy-MM-dd date, or an em dash when absent. */
export function formatDate(date?: string): string {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** "06 Oct 2026, 08:42 AM" from a server timestamp, or an em dash when absent. */
export function formatDateTime(timestamp?: string): string {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Today's date as yyyy-MM-dd, for date input defaults. */
export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** The first day of the current month as yyyy-MM-dd, a sensible default payroll period start. */
export function startOfMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-01`;
}
