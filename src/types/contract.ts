import type { BaseEntity } from '@/types/common';

// Wire values come from ContractStatusEnum, which serialises via @JsonValue in
// lowercase. The backend sets DRAFT on create and exposes no status transition
// endpoint, so status is read-only from the client's point of view.
export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled';

// Mirrors ContractResponseDTO.
export interface ContractResponse extends BaseEntity {
  projectId: string;
  contractNumber: string;
  clientId?: string;
  contractorId?: string;
  workOrderNumber?: string;
  agreementNumber?: string;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  securityDeposit?: number;
  retentionPercentage?: number;
  status: ContractStatus;
  documentReference?: string;
}

// Mirrors ContractRequestDTO, used for both create and update. projectId is
// @NotNull and contractNumber is @NotBlank; contractValue must be positive when
// supplied. Status is not accepted — create always starts at 'draft'.
export interface ContractCreateRequest {
  projectId: string;
  contractNumber: string;
  clientId?: string;
  contractorId?: string;
  workOrderNumber?: string;
  agreementNumber?: string;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  securityDeposit?: number;
  retentionPercentage?: number;
  documentReference?: string;
}

export type ContractUpdateRequest = ContractCreateRequest;

export type Contract = ContractResponse;
export type ContractRequest = ContractCreateRequest | ContractUpdateRequest;
