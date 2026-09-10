import { apiClient } from './api-client';
import type { ApiListResponse } from '@/types/common';
import type {
  MaterialResponse,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialTransferRequest,
  MaterialTransferResponse,
  StockLedgerEntry,
} from '@/types/material';

export const materialApi = {
  // CRUD Operations. Materials are scoped to an organization, which the backend
  // resolves from the caller's membership when organizationId is omitted.
  create: (body: MaterialCreateRequest): Promise<MaterialResponse> =>
    apiClient.post<MaterialResponse>('/materials', body),

  // Note: the backend's /materials list endpoint (MaterialController.listMaterials) returns
  // a flat array — it does not implement pagination despite the x-page/x-limit headers sent here.
  // It also reads no x-filter-* headers, so arbitrary filters are dropped; use search() instead.
  list: (
    projectId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MaterialResponse[]> =>
    apiClient.get<MaterialResponse[]>('/materials', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
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

  // Moves stock between two projects and records both legs in the ledger.
  // Returns the transfer record, not the material.
  transfer: (
    body: MaterialTransferRequest
  ): Promise<MaterialTransferResponse> =>
    apiClient.post<MaterialTransferResponse>('/materials/transfer', body),

  // Search & Filter. Matches material code, name, or category.
  // Note: the backend's search endpoint does not narrow by project.
  search: (query: string): Promise<MaterialResponse[]> =>
    apiClient.get<MaterialResponse[]>('/materials/search', {
      headers: {
        'x-search': query,
      },
    }),

  // Low Stock Alert. Reports materials at or below their minimumStock; when a
  // project is given, stock is measured on that project alone.
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
