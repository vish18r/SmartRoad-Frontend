import type { BaseEntity } from '@/types/common';

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED' | 'ON_HOLD';

export interface ProjectResponse extends BaseEntity {
  organizationId: string;
  clientId?: string;
  code?: string;
  name: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  budget: number;
  actualCost?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
}

export interface ProjectCreateRequest {
  organizationId: string;
  clientId?: string;
  code?: string;
  name: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  budget: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProjectUpdateRequest {
  clientId?: string;
  code?: string;
  name?: string;
  description?: string;
  location?: string;
  status?: ProjectStatus;
  budget?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
}

export type Project = ProjectResponse;
export type ProjectRequest = ProjectCreateRequest | ProjectUpdateRequest;
export type ProjectSummary = ProjectResponse;
