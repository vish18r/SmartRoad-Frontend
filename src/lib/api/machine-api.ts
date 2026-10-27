import { apiClient } from './api-client';
import type {
  MachineResponse,
  MachineCreateRequest,
  MachineUpdateRequest,
  MachinePageResponse,
  MachineStatus,
} from '@/types/machine';

export const machineApi = {
  create: (body: MachineCreateRequest): Promise<MachineResponse> =>
    apiClient.post<MachineResponse>('/machines', body),

  list: (params: {
    organizationId: string;
    status?: MachineStatus;
    currentSiteId?: string;
    page?: number;
    limit?: number;
  }): Promise<MachinePageResponse> => {
    const query = new URLSearchParams();
    query.set('organizationId', params.organizationId);
    if (params.status) query.set('status', params.status);
    if (params.currentSiteId) query.set('currentSiteId', params.currentSiteId);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 100));
    return apiClient.get<MachinePageResponse>(`/machines?${query.toString()}`);
  },

  getById: (id: string): Promise<MachineResponse> =>
    apiClient.get<MachineResponse>(`/machines/${id}`),

  update: (id: string, body: MachineUpdateRequest): Promise<MachineResponse> =>
    apiClient.put<MachineResponse>(`/machines/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/machines/${id}`),
};
