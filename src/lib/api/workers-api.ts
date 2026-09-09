import { apiClient } from "./api-client";
import type { WorkerResponse, WorkerCreateRequest, WorkerUpdateRequest } from "@/types/worker";

export const workersApi = {
  create: (body: WorkerCreateRequest): Promise<WorkerResponse> =>
    apiClient.post<WorkerResponse>("/workers", body),

  list: (organizationId: string): Promise<WorkerResponse[]> =>
    apiClient.get<WorkerResponse[]>(`/workers?organizationId=${organizationId}`),

  listBySite: (siteId: string): Promise<WorkerResponse[]> =>
    apiClient.get<WorkerResponse[]>(`/workers/by-site/${siteId}`),

  getById: (id: string): Promise<WorkerResponse> =>
    apiClient.get<WorkerResponse>(`/workers/${id}`),

  update: (id: string, body: WorkerUpdateRequest): Promise<WorkerResponse> =>
    apiClient.put<WorkerResponse>(`/workers/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/workers/${id}`),
};
