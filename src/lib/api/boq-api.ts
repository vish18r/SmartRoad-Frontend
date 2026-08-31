import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type {
  BoqResponse,
  BoqCreateRequest,
  BoqUpdateRequest,
  BoqItemResponse,
  BoqItemCreateRequest,
  BoqItemUpdateRequest,
} from "@/types/boq";

export const boqApi = {
  create: (projectId: string, body: BoqCreateRequest): Promise<ApiResponse<BoqResponse>> =>
    apiClient.post<BoqResponse>(`/projects/${projectId}/boq`, body),

  listByProject: (projectId: string): Promise<ApiResponse<BoqResponse[]>> =>
    apiClient.get<BoqResponse[]>(`/projects/${projectId}/boq`),

  update: (boqId: string, body: BoqUpdateRequest): Promise<ApiResponse<BoqResponse>> =>
    apiClient.put<BoqResponse>(`/boq/${boqId}`, body),

  delete: (boqId: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/boq/${boqId}`),

  addItem: (boqId: string, body: BoqItemCreateRequest): Promise<ApiResponse<BoqItemResponse>> =>
    apiClient.post<BoqItemResponse>(`/boq/${boqId}/items`, body),

  listItems: (boqId: string): Promise<ApiResponse<BoqItemResponse[]>> =>
    apiClient.get<BoqItemResponse[]>(`/boq/${boqId}/items`),

  updateItem: (boqId: string, itemId: string, body: BoqItemUpdateRequest): Promise<ApiResponse<BoqItemResponse>> =>
    apiClient.put<BoqItemResponse>(`/boq/${boqId}/items/${itemId}`, body),

  deleteItem: (boqId: string, itemId: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/boq/${boqId}/items/${itemId}`),
};
