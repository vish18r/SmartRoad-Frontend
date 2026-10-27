import type { PaginationMeta } from '@/types/common';

// Wire values come from this module's own status enums, plain Java enums with
// no @JsonValue, so they serialise as the constant NAME — uppercase (same
// deviation as machine/vehicle status).
export type ResourcePlanStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ResourceType = 'WORKER' | 'MACHINE' | 'MATERIAL' | 'VEHICLE';

export type AllocationStatus = 'PLANNED' | 'CONFIRMED' | 'CANCELLED';

export type ConflictType =
  | 'WORKER_CONFLICT'
  | 'MACHINE_CONFLICT'
  | 'VEHICLE_CONFLICT'
  | 'RESOURCE_AVAILABILITY'
  | 'MATERIAL_SHORTAGE'
  | 'SHIFT_CONFLICT';

export type ConflictSeverity = 'BLOCKING' | 'WARNING';

// Mirrors ResourcePlanResponseDTO.
export interface ResourcePlanResponse {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  planName: string;
  planDate: string;
  startDate?: string;
  endDate?: string;
  supervisorWorkerId?: string;
  supervisorName?: string;
  description?: string;
  status: ResourcePlanStatus;
  notes?: string;
  hasConflicts: boolean;
  workersCount: number;
  machinesCount: number;
  materialsCount: number;
  vehiclesCount: number;
  createdBy?: string;
  modifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
}

// Mirrors ResourcePlanRequestDTO, used for both create and update.
export interface ResourcePlanRequest {
  organizationId: string;
  projectId: string;
  planName: string;
  planDate: string;
  startDate?: string;
  endDate?: string;
  supervisorWorkerId?: string;
  description?: string;
  notes?: string;
}

export interface ResourcePlanPageResponse {
  items: ResourcePlanResponse[];
  pagination: PaginationMeta;
}

// Mirrors ResourceAllocationRequestDTO.
export interface ResourceAllocationRequest {
  resourceType: ResourceType;
  resourceId: string;
  startTime?: string;
  endTime?: string;
  allocationStartDate: string;
  allocationEndDate?: string;
  plannedQuantity?: number;
  unit?: string;
  assignedWorkerId?: string;
  taskDescription?: string;
  notes?: string;
}

// Mirrors ResourceAllocationResponseDTO.
export interface ResourceAllocationResponse extends ResourceAllocationRequest {
  id: string;
  resourcePlanId: string;
  resourceLabel: string;
  status: AllocationStatus;
}

// Mirrors ResourcePlanDetailResponseDTO.
export interface ResourcePlanDetailResponse {
  plan: ResourcePlanResponse;
  allocations: ResourceAllocationResponse[];
}

// Mirrors ResourcePlanSummaryDTO.
export interface ResourcePlanSummary {
  totalPlans: number;
  workersPlanned: number;
  machinesAllocated: number;
  vehiclesAllocated: number;
  materialsPlanned: number;
  plansWithConflicts: number;
}

// Mirrors ResourceConflictDTO.
export interface ResourceConflict {
  conflictType: ConflictType;
  resourceId: string;
  resourceLabel: string;
  conflictingPlanId?: string;
  conflictingPlanName?: string;
  conflictingProjectId?: string;
  conflictingProjectName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  severity: ConflictSeverity;
  message: string;
}

// Mirrors ResourcePlanValidateRequestDTO. Stateless check — no persistence.
export interface ResourcePlanValidateRequest {
  projectId: string;
  planDate: string;
  excludePlanId?: string;
  allocations: ResourceAllocationRequest[];
}

// Mirrors ResourcePlanValidationResponseDTO. Returned both by /validate and
// (on a 409) by /confirm when blocking conflicts remain.
export interface ResourcePlanValidationResponse {
  conflicts: ResourceConflict[];
  hasBlockingConflicts: boolean;
}

// Mirrors ResourceAvailabilityEntryDTO.
export interface ResourceAvailabilityEntry {
  id: string;
  label: string;
  available: boolean;
  conflictReason?: string;
}

// Mirrors ResourceAvailabilityResponseDTO.
export interface ResourceAvailabilityResponse {
  workers: ResourceAvailabilityEntry[];
  machines: ResourceAvailabilityEntry[];
  materials: ResourceAvailabilityEntry[];
  vehicles: ResourceAvailabilityEntry[];
}
