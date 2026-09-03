import { apiClient } from './api-client';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import type { ContractResponse, ContractCreateRequest, ContractUpdateRequest } from '@/types/contract';

export const contractApi = {
  create: (body: ContractCreateRequest): Promise<ApiResponse<ContractResponse>> =>
    apiClient.post<ContractResponse>('/contracts', body),

  list: (projectId?: string, page: number = 1, limit: number = 20): Promise<ApiResponse<ApiListResponse<ContractResponse>>> =>
    apiClient.get<ApiListResponse<ContractResponse>>('/contracts', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
      },
    }),

  getById: (id: string): Promise<ApiResponse<ContractResponse>> =>
    apiClient.get<ContractResponse>(`/contracts/${id}`),

  update: (id: string, body: ContractUpdateRequest): Promise<ApiResponse<ContractResponse>> =>
    apiClient.put<ContractResponse>(`/contracts/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/contracts/${id}`),

  getByProject: (projectId: string): Promise<ApiResponse<ContractResponse[]>> =>
    apiClient.get<ContractResponse[]>(`/projects/${projectId}/contracts`),

  getByClient: (clientId: string): Promise<ApiResponse<ContractResponse[]>> =>
    apiClient.get<ContractResponse[]>(`/clients/${clientId}/contracts`),

  search: (query: string): Promise<ApiResponse<ContractResponse[]>> =>
    apiClient.get<ContractResponse[]>('/contracts/search', {
      headers: { 'x-search': query },
    }),

  getList: (projectId?: string): Promise<ApiResponse<ContractResponse[]>> =>
    contractApi.list(projectId, 1, 1000),

  remove: (id: string): Promise<ApiResponse<null>> =>
    contractApi.delete(id),
};
