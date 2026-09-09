import { apiClient } from "./api-client";
import type { ProjectResponse, ProjectCreateRequest, ProjectUpdateRequest } from "@/types/project";

export const projectApi = {
  create: (body: ProjectCreateRequest): Promise<ProjectResponse> =>
    apiClient.post<ProjectResponse>("/projects", body),

  list: (organizationId: string): Promise<ProjectResponse[]> =>
    apiClient.get<ProjectResponse[]>(`/projects?organizationId=${organizationId}`),

  getById: (id: string): Promise<ProjectResponse> =>
    apiClient.get<ProjectResponse>(`/projects/${id}`),

  update: (id: string, body: ProjectUpdateRequest): Promise<ProjectResponse> =>
    apiClient.put<ProjectResponse>(`/projects/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/projects/${id}`),

  // Legacy method names for backward compatibility
  getList: (organizationId: string): Promise<ProjectResponse[]> =>
    projectApi.list(organizationId),

  remove: (id: string): Promise<null> =>
    projectApi.delete(id),
};
