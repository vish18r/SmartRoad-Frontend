import { apiClient } from "./api-client";
import type {
  BoqResponse,
  BoqCreateRequest,
  BoqUpdateRequest,
  BoqItemResponse,
  BoqItemCreateRequest,
  BoqItemUpdateRequest,
} from "@/types/boq";

export const boqApi = {
  create: (projectId: string, body: BoqCreateRequest): Promise<BoqResponse> =>
    apiClient.post<BoqResponse>(`/projects/${projectId}/boq`, body),

  listByProject: (projectId: string): Promise<BoqResponse[]> =>
    apiClient.get<BoqResponse[]>(`/projects/${projectId}/boq`),

  update: (boqId: string, body: BoqUpdateRequest): Promise<BoqResponse> =>
    apiClient.put<BoqResponse>(`/boq/${boqId}`, body),

  delete: (boqId: string): Promise<null> =>
    apiClient.delete<null>(`/boq/${boqId}`),

  addItem: (boqId: string, body: BoqItemCreateRequest): Promise<BoqItemResponse> =>
    apiClient.post<BoqItemResponse>(`/boq/${boqId}/items`, body),

  listItems: (boqId: string): Promise<BoqItemResponse[]> =>
    apiClient.get<BoqItemResponse[]>(`/boq/${boqId}/items`),

  updateItem: (boqId: string, itemId: string, body: BoqItemUpdateRequest): Promise<BoqItemResponse> =>
    apiClient.put<BoqItemResponse>(`/boq/${boqId}/items/${itemId}`, body),

  deleteItem: (boqId: string, itemId: string): Promise<null> =>
    apiClient.delete<null>(`/boq/${boqId}/items/${itemId}`),
};
