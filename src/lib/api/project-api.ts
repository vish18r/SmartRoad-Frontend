import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { ProjectResponse, ProjectCreateRequest, ProjectUpdateRequest } from "@/types/project";

export const projectApi = {
  create: (body: ProjectCreateRequest): Promise<ApiResponse<ProjectResponse>> =>
    apiClient.post<ProjectResponse>("/projects", body),

  list: (organizationId: string): Promise<ApiResponse<ProjectResponse[]>> =>
    apiClient.get<ProjectResponse[]>(`/projects?organizationId=${organizationId}`),

  getById: (id: string): Promise<ApiResponse<ProjectResponse>> =>
    apiClient.get<ProjectResponse>(`/projects/${id}`),

  update: (id: string, body: ProjectUpdateRequest): Promise<ApiResponse<ProjectResponse>> =>
    apiClient.put<ProjectResponse>(`/projects/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/projects/${id}`),

  // Legacy method names for backward compatibility
  getList: (organizationId: string): Promise<ApiResponse<ProjectResponse[]>> =>
    projectApi.list(organizationId),

  remove: (id: string): Promise<ApiResponse<null>> =>
    projectApi.delete(id),
};
