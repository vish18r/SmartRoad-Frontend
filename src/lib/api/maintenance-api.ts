import { apiClient } from './api-client';
import type {
  MaintenanceRecord,
  MaintenanceRequest,
  MaintenancePageResponse,
  MaintenanceSummary,
  MaintenanceReminders,
  MaintenanceListParams,
  MaintenanceStartRequest,
  MaintenanceCompleteRequest,
  MaintenanceCancelRequest,
} from '@/types/maintenance';

function withOrganization(query: URLSearchParams, organizationId?: string) {
  if (organizationId) query.set('organizationId', organizationId);
}

export const maintenanceApi = {
  // POST /api/v1/maintenance
  create: (body: MaintenanceRequest, organizationId?: string): Promise<MaintenanceRecord> => {
    const query = new URLSearchParams();
    withOrganization(query, organizationId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.post<MaintenanceRecord>(`/maintenance${suffix}`, body);
  },

  // GET /api/v1/maintenance?machineId&status&priority&type&projectId&dateFrom&dateTo&upcoming&overdue&page&limit
  list: (params: MaintenanceListParams): Promise<MaintenancePageResponse> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    if (params.machineId) query.set('machineId', params.machineId);
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.type) query.set('type', params.type);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.upcoming) query.set('upcoming', 'true');
    if (params.overdue) query.set('overdue', 'true');
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return apiClient.get<MaintenancePageResponse>(`/maintenance?${query.toString()}`);
  },

  // GET /api/v1/maintenance/{id}
  getById: (id: string): Promise<MaintenanceRecord> =>
    apiClient.get<MaintenanceRecord>(`/maintenance/${id}`),

  // PUT /api/v1/maintenance/{id}
  update: (id: string, body: MaintenanceRequest): Promise<MaintenanceRecord> =>
    apiClient.put<MaintenanceRecord>(`/maintenance/${id}`, body),

  // DELETE /api/v1/maintenance/{id} — soft cancel (rejected for completed records).
  delete: (id: string): Promise<MaintenanceRecord> =>
    apiClient.delete<MaintenanceRecord>(`/maintenance/${id}`),

  // POST /api/v1/maintenance/{id}/start
  start: (id: string, body: MaintenanceStartRequest = {}): Promise<MaintenanceRecord> =>
    apiClient.post<MaintenanceRecord>(`/maintenance/${id}/start`, body),

  // POST /api/v1/maintenance/{id}/complete
  complete: (id: string, body: MaintenanceCompleteRequest = {}): Promise<MaintenanceRecord> =>
    apiClient.post<MaintenanceRecord>(`/maintenance/${id}/complete`, body),

  // POST /api/v1/maintenance/{id}/cancel
  cancel: (id: string, body: MaintenanceCancelRequest = {}): Promise<MaintenanceRecord> =>
    apiClient.post<MaintenanceRecord>(`/maintenance/${id}/cancel`, body),

  // GET /api/v1/machines/{machineId}/maintenance
  getMachineHistory: (
    machineId: string,
    params: { organizationId?: string; page?: number; limit?: number } = {}
  ): Promise<MaintenancePageResponse> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return apiClient.get<MaintenancePageResponse>(`/machines/${machineId}/maintenance?${query.toString()}`);
  },

  // GET /api/v1/maintenance/upcoming?days
  getUpcoming: (
    params: { organizationId?: string; days?: number; page?: number; limit?: number } = {}
  ): Promise<MaintenancePageResponse> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    if (params.days) query.set('days', String(params.days));
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return apiClient.get<MaintenancePageResponse>(`/maintenance/upcoming?${query.toString()}`);
  },

  // GET /api/v1/maintenance/overdue
  getOverdue: (
    params: { organizationId?: string; page?: number; limit?: number } = {}
  ): Promise<MaintenancePageResponse> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return apiClient.get<MaintenancePageResponse>(`/maintenance/overdue?${query.toString()}`);
  },

  // GET /api/v1/maintenance/summary?startDate&endDate
  getSummary: (
    params: { organizationId?: string; startDate?: string; endDate?: string } = {}
  ): Promise<MaintenanceSummary> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<MaintenanceSummary>(`/maintenance/summary${suffix}`);
  },

  // GET /api/v1/maintenance/calendar?startDate&endDate (max 92 days)
  getCalendar: (params: { organizationId?: string; startDate: string; endDate: string }): Promise<MaintenanceRecord[]> => {
    const query = new URLSearchParams();
    withOrganization(query, params.organizationId);
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    return apiClient.get<MaintenanceRecord[]>(`/maintenance/calendar?${query.toString()}`);
  },

  // GET /api/v1/maintenance/reminders — computed only; nothing is dispatched.
  getReminders: (organizationId?: string): Promise<MaintenanceReminders> => {
    const query = new URLSearchParams();
    withOrganization(query, organizationId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<MaintenanceReminders>(`/maintenance/reminders${suffix}`);
  },
};
