import type { BaseEntity } from '@/types/common';

// Wire values come from MachineStatusEnum, a plain Java enum with no @JsonValue,
// so it serialises as the constant NAME — uppercase (unlike most other status
// enums in this app).
export type MachineStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'RETIRED';

// Mirrors MachineResponseDTO.
export interface MachineResponse extends BaseEntity {
  organizationId: string;
  name: string;
  type?: string;
  status?: MachineStatus;
  registrationNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  currentSiteId?: string;
  currentSiteName?: string;
  currentValue?: number;
  workingHours?: number;
  maintenanceStatus?: string;
  fuelType?: string;
  capacity?: number;
  operatorName?: string;
}

// Mirrors MachineRequestDTO, used for both create and update.
export interface MachineCreateRequest {
  organizationId: string;
  name: string;
  type?: string;
  status?: MachineStatus;
  registrationNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  currentSiteId?: string;
  currentValue?: number;
  workingHours?: number;
  maintenanceStatus?: string;
  fuelType?: string;
  capacity?: number;
  operatorName?: string;
}

export type MachineUpdateRequest = MachineCreateRequest;

export interface MachinePageResponse {
  items: MachineResponse[];
  pagination: import('@/types/common').PaginationMeta;
}

export type Machine = MachineResponse;
export type MachineRequest = MachineCreateRequest | MachineUpdateRequest;
