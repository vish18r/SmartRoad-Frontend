import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { WorkerResponse, WorkerCreateRequest, WorkerUpdateRequest } from "@/types/worker";

export const workersApi = {
  create: (body: WorkerCreateRequest): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.post<WorkerResponse>("/workers", body),

  list: (organizationId: string): Promise<ApiResponse<WorkerResponse[]>> =>
    apiClient.get<WorkerResponse[]>(`/workers?organizationId=${organizationId}`),

  listBySite: (siteId: string): Promise<ApiResponse<WorkerResponse[]>> =>
    apiClient.get<WorkerResponse[]>(`/workers/by-site/${siteId}`),

  getById: (id: string): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.get<WorkerResponse>(`/workers/${id}`),

  update: (id: string, body: WorkerUpdateRequest): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.put<WorkerResponse>(`/workers/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/workers/${id}`),
};
