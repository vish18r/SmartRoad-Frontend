import type { PaginationMeta } from '@/types/common';

// Wire values come from the backend's shift enums, which serialise via @JsonValue in
// lower_snake_case. Inbound parsing on the backend is case-insensitive, but responses are
// always lowercase — compare against these, not 'ACTIVE'.
export type ShiftStatus = 'active' | 'inactive';

export type ShiftAssignmentStatus = 'active' | 'inactive' | 'ended';

// Mirrors ShiftResponseDTO. totalWorkingMinutes is always backend-computed (overnight-aware,
// break duration already subtracted) — never recomputed on the client except for the live
// preview shown while filling out the create/edit form.
export interface ShiftResponse {
  id: string;
  organizationId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  totalWorkingMinutes: number;
  description?: string;
  status: ShiftStatus;
  assignedWorkersCount?: number;
}

// Mirrors ShiftRequestDTO, used for both create and update.
export interface ShiftRequest {
  organizationId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: number;
  description?: string;
  status?: ShiftStatus;
}

// Mirrors ShiftPageResponseDTO.
export interface ShiftPageResponse {
  data: ShiftResponse[];
  pagination: PaginationMeta;
}

// Mirrors ShiftSummaryResponseDTO, the shift management dashboard summary cards.
export interface ShiftSummary {
  totalShiftTemplates: number;
  activeShifts: number;
  inactiveShifts: number;
  workersAssigned: number;
  unassignedWorkers: number;
}

// Filters accepted by GET /shifts.
export interface ShiftListFilters {
  organizationId?: string;
  status?: ShiftStatus;
  search?: string;
}

// Mirrors ShiftAssignmentResponseDTO. Worker and shift identity fields are denormalized at read
// time for display; the persisted row holds only the two ids.
export interface ShiftAssignmentResponse {
  id: string;
  workerId: string;
  employeeId?: string;
  workerName?: string;
  shiftId: string;
  shiftCode?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  totalWorkingMinutes?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: ShiftAssignmentStatus;
}

// Mirrors ShiftAssignmentRequestDTO, used for both create and update.
export interface ShiftAssignmentRequest {
  workerId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status?: ShiftAssignmentStatus;
}

// Mirrors ShiftAssignmentPageResponseDTO.
export interface ShiftAssignmentPageResponse {
  data: ShiftAssignmentResponse[];
  pagination: PaginationMeta;
}

// Filters accepted by GET /shifts/assignments.
export interface ShiftAssignmentListFilters {
  organizationId?: string;
  workerId?: string;
  shiftId?: string;
  status?: ShiftAssignmentStatus;
  effectiveDate?: string;
}
