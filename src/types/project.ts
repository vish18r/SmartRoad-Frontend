import type { BaseEntity } from '@/types/common';

// ProjectStatus is a plain Java enum with no @JsonValue, so unlike the other
// status enums in this API it serialises as the constant NAME — uppercase.
// Archived-ness is not a status: it is the separate `archived` boolean, and the
// list endpoint already excludes archived projects.
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

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
