export interface BoqResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string;
}

export interface BoqCreateRequest {
  name: string;
  description?: string;
}

export interface BoqUpdateRequest {
  name?: string;
  description?: string;
}

export interface BoqItemResponse {
  id: string;
  boqId: string;
  itemCode?: string;
  description?: string;
  unit?: string;
  estimatedQuantity: number;
  rate: number;
  estimatedAmount: number;
  actualQuantity?: number;
  actualRate?: number;
  actualAmount?: number;
  quantityVariance?: number;
  costVariance?: number;
}

export interface BoqItemCreateRequest {
  itemCode?: string;
  description?: string;
  unit?: string;
  estimatedQuantity: number;
  rate: number;
  estimatedAmount: number;
}

export interface BoqItemUpdateRequest {
  itemCode?: string;
  description?: string;
  unit?: string;
  estimatedQuantity?: number;
  rate?: number;
  estimatedAmount?: number;
  actualQuantity?: number;
  actualRate?: number;
  actualAmount?: number;
}

export type Boq = BoqResponse;
export type BoqRequest = BoqCreateRequest | BoqUpdateRequest;
export type BoqItem = BoqItemResponse;
export type BoqItemRequest = BoqItemCreateRequest | BoqItemUpdateRequest;
