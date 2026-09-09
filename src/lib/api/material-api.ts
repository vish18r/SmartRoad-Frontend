import { apiClient } from './api-client';
import type { ApiListResponse } from '@/types/common';
import type {
  MaterialResponse,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialTransferRequest,
  StockLedgerEntry,
} from '@/types/material';

export const materialApi = {
  // CRUD Operations
  create: (body: MaterialCreateRequest): Promise<MaterialResponse> =>
    apiClient.post<MaterialResponse>('/materials', body),

  // Note: the backend's /materials list endpoint (MaterialController.listMaterials) returns
  // a flat array — it does not implement pagination despite the x-page/x-limit headers sent here.
  list: (
    projectId?: string,
    page: number = 1,
    limit: number = 20,
    filters?: Record<string, any>
  ): Promise<MaterialResponse[]> =>
    apiClient.get<MaterialResponse[]>('/materials', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
        ...Object.fromEntries(
          Object.entries(filters || {}).map(([k, v]) => [
            `x-filter-${k}`,
            String(v),
          ])
        ),
      },
    }),

  getById: (id: string): Promise<MaterialResponse> =>
    apiClient.get<MaterialResponse>(`/materials/${id}`),

  update: (
    id: string,
    body: MaterialUpdateRequest
  ): Promise<MaterialResponse> =>
    apiClient.put<MaterialResponse>(`/materials/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/materials/${id}`),

  // Stock Management
  getStockLedger: (
    materialId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiListResponse<StockLedgerEntry>> =>
    apiClient.get<ApiListResponse<StockLedgerEntry>>(
      `/materials/${materialId}/stock-ledger`,
      {
        headers: {
          'x-page': String(page),
          'x-limit': String(limit),
        },
      }
    ),

  transfer: (
    body: MaterialTransferRequest
  ): Promise<MaterialResponse> =>
    apiClient.post<MaterialResponse>('/materials/transfer', body),

  // Search & Filter
  search: (
    query: string,
    projectId?: string,
    limit: number = 20
  ): Promise<MaterialResponse[]> =>
    apiClient.get<MaterialResponse[]>('/materials/search', {
      headers: {
        'x-search': query,
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
      },
    }),

  // Low Stock Alert
  getLowStockItems: (
    projectId?: string
  ): Promise<MaterialResponse[]> =>
    apiClient.get<MaterialResponse[]>('/materials/low-stock', {
      headers: {
        ...(projectId && { 'x-project-id': projectId }),
      },
    }),

  // Legacy method names for backward compatibility
  getList: (projectId?: string): Promise<MaterialResponse[]> =>
    materialApi.list(projectId, 1, 1000),

  remove: (id: string): Promise<null> =>
    materialApi.delete(id),
};
