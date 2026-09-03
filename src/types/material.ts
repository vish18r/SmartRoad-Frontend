import type { BaseEntity } from '@/types/common';

export type MaterialStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
export type UnitOfMeasure = 'KG' | 'LITER' | 'UNIT' | 'METER' | 'CUBIC_METER' | 'SQUARE_METER' | 'TON' | 'BAG';

export interface MaterialResponse extends BaseEntity {
  projectId?: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unitOfMeasure: UnitOfMeasure;
  quantity: number;
  unitCost: number;
  totalCost: number;
  minimumStock?: number;
  maximumStock?: number;
  status: MaterialStatus;
  supplierId?: string;
  poNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface MaterialCreateRequest {
  projectId?: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unitOfMeasure: UnitOfMeasure;
  quantity: number;
  unitCost: number;
  minimumStock?: number;
  maximumStock?: number;
  supplierId?: string;
  poNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface MaterialUpdateRequest {
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unitCost?: number;
  status?: MaterialStatus;
  minimumStock?: number;
  maximumStock?: number;
  expiryDate?: string;
  notes?: string;
}

export interface MaterialTransferRequest {
  materialId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface StockLedgerEntry extends BaseEntity {
  materialId: string;
  transactionType: 'RECEIVED' | 'ISSUED' | 'TRANSFER' | 'ADJUSTMENT' | 'CONSUMPTION';
  quantity: number;
  referenceNumber?: string;
  notes?: string;
}
