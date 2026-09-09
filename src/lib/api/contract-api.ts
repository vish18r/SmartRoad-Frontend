import { apiClient } from './api-client';
import type { ContractResponse, ContractCreateRequest, ContractUpdateRequest } from '@/types/contract';

export const contractApi = {
  create: (body: ContractCreateRequest): Promise<ContractResponse> =>
    apiClient.post<ContractResponse>('/contracts', body),

  // Note: the backend's /contracts list endpoint returns a flat array — pagination is not implemented.
  list: (projectId?: string, page: number = 1, limit: number = 20): Promise<ContractResponse[]> =>
    apiClient.get<ContractResponse[]>('/contracts', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
      },
    }),

  getById: (id: string): Promise<ContractResponse> =>
    apiClient.get<ContractResponse>(`/contracts/${id}`),

  update: (id: string, body: ContractUpdateRequest): Promise<ContractResponse> =>
    apiClient.put<ContractResponse>(`/contracts/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/contracts/${id}`),

  getByProject: (projectId: string): Promise<ContractResponse[]> =>
    apiClient.get<ContractResponse[]>(`/projects/${projectId}/contracts`),

  getByClient: (clientId: string): Promise<ContractResponse[]> =>
    apiClient.get<ContractResponse[]>(`/clients/${clientId}/contracts`),

  search: (query: string): Promise<ContractResponse[]> =>
    apiClient.get<ContractResponse[]>('/contracts/search', {
      headers: { 'x-search': query },
    }),

  getList: (projectId?: string): Promise<ContractResponse[]> =>
    contractApi.list(projectId, 1, 1000),

  remove: (id: string): Promise<null> =>
    contractApi.delete(id),
};
