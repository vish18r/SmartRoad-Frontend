import type { BaseEntity } from '@/types/common';

// Wire values come from WorkerStatusEnum, which serialises via @JsonValue in
// lower_snake_case. Inbound parsing is case-insensitive, but responses are
// always lowercase — compare against these, not 'ACTIVE'.
// Mirrors WorkerFaceStatusEnum. Only FACE_REGISTERED workers can use face check-in.
export type WorkerFaceStatus = 'FACE_REGISTERED' | 'FACE_NOT_REGISTERED';

export type WorkerStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'suspended'
  | 'terminated';

// Wire values come from AttendanceStatusEnum (@JsonValue, lower_snake_case).
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

// Wire values come from WageTypeEnum (@JsonValue, lower_snake_case). Used for payroll.
export type WageType = 'daily' | 'monthly';

// Mirrors WorkerResponseDTO. The backend models a worker's job as a free-text
// `role` and their posting as `assignedSiteId` (a project ID).
export interface WorkerResponse extends BaseEntity {
  organizationId: string;
  firstName: string;
  lastName?: string;
  emailId?: string;
  phoneNumber?: string;
  status: WorkerStatus;
  role?: string;
  joiningDate?: string;
  assignedSiteId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  aadharNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  experienceYears?: number;
  employeeId: string;
  fullName: string;
  faceStatus: WorkerFaceStatus;
  // Wage configuration, used by payroll calculation. A worker created before this feature may
  // have wageType default to 'daily' with no dailyWage/monthlyWage set yet.
  wageType: WageType;
  dailyWage?: number;
  monthlyWage?: number;
  overtimeRate?: number;
  wageEffectiveDate?: string;
  wageActive?: boolean;
}

// Mirrors WorkerRequestDTO, used for both create and update. organizationId and
// status are @NotNull and firstName is @NotBlank; organizationId is read from
// the body — the controller's query parameter of the same name is ignored.
export interface WorkerCreateRequest {
  organizationId: string;
  firstName: string;
  lastName?: string;
  emailId?: string;
  phoneNumber?: string;
  status: WorkerStatus;
  role?: string;
  joiningDate?: string;
  assignedSiteId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  aadharNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  experienceYears?: number;
  // 128-value face embedding as a JSON array string. Required when registering a new worker.
  faceDescriptor?: string;
  // Wage configuration. Omit to leave the backend default (wageType 'daily', wageActive true).
  wageType?: WageType;
  dailyWage?: number;
  monthlyWage?: number;
  overtimeRate?: number;
  wageEffectiveDate?: string;
  wageActive?: boolean;
}

export type WorkerUpdateRequest = WorkerCreateRequest;

// Mirrors AttendanceResponseDTO.
export interface AttendanceResponse {
  id: string;
  workerId: string;
  projectId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
}

// Mirrors AttendanceRequestDTO. Re-marking the same worker, project and date
// updates the existing record rather than creating a duplicate.
export interface AttendanceCreateRequest {
  workerId: string;
  projectId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
}

export type Worker = WorkerResponse;
export type WorkerRequest = WorkerCreateRequest | WorkerUpdateRequest;
