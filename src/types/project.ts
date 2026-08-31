export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

export interface ProjectResponse {
  id: string;
  organizationId: string;
  clientId?: string;
  code?: string;
  name: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  archived?: boolean;
}

export interface ProjectCreateRequest {
  name: string;
  code?: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  budget: number;
  clientId?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  location?: string;
  status?: ProjectStatus;
  budget?: number;
  clientId?: string;
}

export type Project = ProjectResponse;
export type ProjectRequest = ProjectCreateRequest | ProjectUpdateRequest;
export type ProjectSummary = ProjectResponse;
