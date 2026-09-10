import type { BaseEntity } from '@/types/common';

// Wire values come from StockTransactionTypeEnum, which serialises via @JsonValue
// in lower_snake_case.
export type StockTransactionType =
  | 'received'
  | 'issued'
  | 'transfer'
  | 'adjustment'
  | 'consumption';

// Wire values come from StockTransferStatusEnum (@JsonValue, lower_snake_case).
export type StockTransferStatus =
  | 'requested'
  | 'approved'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

// Mirrors MaterialResponseDTO. Materials are catalogue rows scoped to an
// organization; per-project quantities live in the stock ledger, not here.
export interface MaterialResponse extends BaseEntity {
  organizationId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  category?: string;
  description?: string;
  minimumStock?: number;
}

// Mirrors MaterialRequestDTO. The backend uses one request DTO for create and
// update, and materialCode/materialName/unit are @NotBlank on both — so an
// update must resend materialCode even though the service ignores it.
export interface MaterialCreateRequest {
  materialCode: string;
  materialName: string;
  unit: string;
  category?: string;
  description?: string;
  minimumStock?: number;
}

export type MaterialUpdateRequest = MaterialCreateRequest;

// Mirrors StockTransferRequestDTO. Transfers move stock between projects, so
// source and destination are project IDs — not free-text locations.
export interface MaterialTransferRequest {
  sourceProjectId: string;
  destinationProjectId: string;
  materialId: string;
  quantityRequested: number;
  transferDate?: string;
}

// Mirrors StockTransferResponseDTO.
export interface MaterialTransferResponse {
  id: string;
  sourceProjectId: string;
  destinationProjectId: string;
  materialId: string;
  quantityRequested: number;
  quantityTransferred?: number;
  transferDate?: string;
  requestedBy?: string;
  approvedBy?: string;
  status: StockTransferStatus;
  createdBy?: string;
  modifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
}

// Mirrors StockLedgerEntryResponseDTO. Quantity is signed: the outgoing leg of a
// transfer is negative.
export interface StockLedgerEntry {
  id: string;
  materialId: string;
  projectId?: string;
  transactionType: StockTransactionType;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
  createdDate?: string;
}

export type Material = MaterialResponse;
export type MaterialRequest = MaterialCreateRequest | MaterialUpdateRequest;
