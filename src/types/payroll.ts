import type { PaginationMeta } from '@/types/common';

// Wire values come from the backend's payroll enums, which all serialise via @JsonValue in
// lower_snake_case. Inbound parsing on the backend is case-insensitive, but responses are
// always lowercase — compare against these, not 'DAILY'/'DRAFT'/etc.
export type WageType = 'daily' | 'monthly';

export type PayrollStatus = 'draft' | 'processed' | 'approved' | 'paid' | 'cancelled';

export type AllowanceType = 'travel' | 'food' | 'accommodation' | 'site' | 'performance' | 'other';

export type DeductionType =
  | 'salary_advance'
  | 'loan_deduction'
  | 'late_deduction'
  | 'absence_deduction'
  | 'other_deduction';

// Mirrors PayrollAllowanceDTO. `id` is present only on a line already persisted.
export interface PayrollAllowance {
  id?: string;
  allowanceType: AllowanceType;
  description?: string;
  amount: number;
}

// Mirrors PayrollDeductionDTO. `id` is present only on a line already persisted.
export interface PayrollDeduction {
  id?: string;
  deductionType: DeductionType;
  description?: string;
  amount: number;
}

// Mirrors AttendanceBreakdownDTO. Every figure here is computed by the backend from the
// worker's attendance sessions — never derived on the client.
export interface AttendanceBreakdown {
  presentDays: number;
  absentDays: number;
  paidDays: number;
  totalWorkedHours: number;
  regularHours: number;
  overtimeHours: number;
}

// Mirrors PayrollResponseDTO. A calculation preview (from POST /payroll/calculate) carries a
// null/undefined id and status; every other field is always backend-computed.
export interface PayrollResponse {
  id?: string;
  organizationId: string;
  workerId: string;
  employeeId: string;
  workerName?: string;
  mobileNumber?: string;
  siteId?: string;
  siteName?: string;
  payrollStartDate: string;
  payrollEndDate: string;
  wageType: WageType;
  dailyWage?: number;
  monthlyWage?: number;
  attendance: AttendanceBreakdown;
  regularHoursPerDay?: number;
  overtimeRate: number;
  basicWage: number;
  overtimeAmount: number;
  allowances: PayrollAllowance[];
  totalAllowances: number;
  grossPay: number;
  deductions: PayrollDeduction[];
  totalDeductions: number;
  netPay: number;
  status?: PayrollStatus;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
}

// Mirrors PayrollCalculateRequestDTO / PayrollRequestDTO. The same shape previews a calculation
// (POST /payroll/calculate) and creates or updates a payroll (POST/PUT /payroll); the backend
// always recalculates every figure from the worker's wage configuration and attendance sessions.
export interface PayrollRequest {
  workerId: string;
  startDate: string;
  endDate: string;
  regularHoursPerDay?: number;
  overtimeRate?: number;
  allowances?: PayrollAllowance[];
  deductions?: PayrollDeduction[];
}

export type PayrollCalculateRequest = PayrollRequest;

// Mirrors PayrollSummaryResponseDTO, the payroll dashboard summary cards.
export interface PayrollSummary {
  totalWorkers: number;
  totalGrossPayroll: number;
  totalDeductions: number;
  totalNetPay: number;
  pendingPayrollCount: number;
  paidPayrollCount: number;
}

// Mirrors PayrollPageResponseDTO.
export interface PayrollPageResponse {
  data: PayrollResponse[];
  pagination: PaginationMeta;
}

// Filters accepted by GET /payroll and GET /payroll/summary.
export interface PayrollListFilters {
  organizationId?: string;
  workerId?: string;
  employeeId?: string;
  status?: PayrollStatus;
  wageType?: WageType;
  startDate?: string;
  endDate?: string;
  search?: string;
}
