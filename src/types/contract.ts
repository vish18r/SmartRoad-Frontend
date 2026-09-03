import type { BaseEntity } from '@/types/common';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'EXPIRED' | 'PENDING';
export type BillingTerms = 'MONTHLY' | 'QUARTERLY' | 'QUARTERLY' | 'UPON_COMPLETION' | 'MILESTONE_BASED';
export type PaymentTerms = 'ADVANCE' | 'ON_DELIVERY' | 'NET_30' | 'NET_60' | 'MILESTONE_BASED';

export interface ContractResponse extends BaseEntity {
  projectId: string;
  clientId: string;
  contractNumber: string;
  title: string;
  description?: string;
  contractValue: number;
  billingTerms: BillingTerms;
  paymentTerms: PaymentTerms;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  signedDate?: string;
  notes?: string;
  documentUrl?: string;
}

export interface ContractCreateRequest {
  projectId: string;
  clientId: string;
  contractNumber: string;
  title: string;
  description?: string;
  contractValue: number;
  billingTerms: BillingTerms;
  paymentTerms: PaymentTerms;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface ContractUpdateRequest {
  clientId?: string;
  title?: string;
  description?: string;
  contractValue?: number;
  billingTerms?: BillingTerms;
  paymentTerms?: PaymentTerms;
  status?: ContractStatus;
  endDate?: string;
  notes?: string;
}
