import { apiClient } from './api-client';
import type {
  VehicleResponse,
  VehicleCreateRequest,
  VehicleUpdateRequest,
  VehiclePageResponse,
  VehicleStatus,
} from '@/types/vehicle';

export const vehicleApi = {
  create: (body: VehicleCreateRequest): Promise<VehicleResponse> =>
    apiClient.post<VehicleResponse>('/vehicles', body),

  list: (params: {
    organizationId: string;
    status?: VehicleStatus;
    currentSiteId?: string;
    page?: number;
    limit?: number;
  }): Promise<VehiclePageResponse> => {
    const query = new URLSearchParams();
    query.set('organizationId', params.organizationId);
    if (params.status) query.set('status', params.status);
    if (params.currentSiteId) query.set('currentSiteId', params.currentSiteId);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 100));
    return apiClient.get<VehiclePageResponse>(`/vehicles?${query.toString()}`);
  },

  getById: (id: string): Promise<VehicleResponse> =>
    apiClient.get<VehicleResponse>(`/vehicles/${id}`),

  update: (id: string, body: VehicleUpdateRequest): Promise<VehicleResponse> =>
    apiClient.put<VehicleResponse>(`/vehicles/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/vehicles/${id}`),
};
