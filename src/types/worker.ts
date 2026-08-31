export type WorkerStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export interface WorkerResponse {
  id: string;
  organizationId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status: WorkerStatus;
  joinDate?: string;
  skills?: string[];
}

export interface WorkerCreateRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: WorkerStatus;
  joinDate?: string;
  skills?: string[];
}

export interface WorkerUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: WorkerStatus;
  skills?: string[];
}

export type Worker = WorkerResponse;
export type WorkerRequest = WorkerCreateRequest | WorkerUpdateRequest;
