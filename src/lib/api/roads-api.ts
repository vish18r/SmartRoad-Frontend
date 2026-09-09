import { apiClient } from "./api-client";
import type {
  RoadResponse,
  RoadCreateRequest,
  RoadUpdateRequest,
  RoadSectionResponse,
  RoadSectionCreateRequest,
  RoadSectionUpdateRequest,
} from "@/types/road";

export const roadsApi = {
  create: (projectId: string, body: RoadCreateRequest): Promise<RoadResponse> =>
    apiClient.post<RoadResponse>(`/projects/${projectId}/roads`, body),

  listByProject: (projectId: string): Promise<RoadResponse[]> =>
    apiClient.get<RoadResponse[]>(`/projects/${projectId}/roads`),

  getById: (id: string): Promise<RoadResponse> =>
    apiClient.get<RoadResponse>(`/roads/${id}`),

  update: (id: string, body: RoadUpdateRequest): Promise<RoadResponse> =>
    apiClient.put<RoadResponse>(`/roads/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/roads/${id}`),

  createSection: (roadId: string, body: RoadSectionCreateRequest): Promise<RoadSectionResponse> =>
    apiClient.post<RoadSectionResponse>(`/roads/${roadId}/sections`, body),

  listSections: (roadId: string): Promise<RoadSectionResponse[]> =>
    apiClient.get<RoadSectionResponse[]>(`/roads/${roadId}/sections`),

  updateSection: (
    roadId: string,
    sectionId: string,
    body: RoadSectionUpdateRequest
  ): Promise<RoadSectionResponse> =>
    apiClient.put<RoadSectionResponse>(`/roads/${roadId}/sections/${sectionId}`, body),

  deleteSection: (roadId: string, sectionId: string): Promise<null> =>
    apiClient.delete<null>(`/roads/${roadId}/sections/${sectionId}`),
};
