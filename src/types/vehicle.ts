import type { BaseEntity } from '@/types/common';

// Wire values come from VehicleStatusEnum, a plain Java enum with no @JsonValue,
// so it serialises as the constant NAME — uppercase.
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

// Mirrors VehicleResponseDTO.
export interface VehicleResponse extends BaseEntity {
  organizationId: string;
  registrationNumber: string;
  vehicleType?: string;
  status?: VehicleStatus;
  currentSiteId?: string;
  currentSiteName?: string;
  driverWorkerId?: string;
  driverName?: string;
  capacity?: number;
  notes?: string;
}

// Mirrors VehicleRequestDTO, used for both create and update.
export interface VehicleCreateRequest {
  organizationId: string;
  registrationNumber: string;
  vehicleType?: string;
  status?: VehicleStatus;
  currentSiteId?: string;
  driverWorkerId?: string;
  capacity?: number;
  notes?: string;
}

export type VehicleUpdateRequest = VehicleCreateRequest;

export interface VehiclePageResponse {
  items: VehicleResponse[];
  pagination: import('@/types/common').PaginationMeta;
}

export type Vehicle = VehicleResponse;
export type VehicleRequest = VehicleCreateRequest | VehicleUpdateRequest;
