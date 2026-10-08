import { apiClient } from './api-client';
import type {
  PayrollCalculateRequest,
  PayrollListFilters,
  PayrollPageResponse,
  PayrollRequest,
  PayrollResponse,
  PayrollSummary,
} from '@/types/payroll';

// Builds a query string from the filters the backend's GET /payroll and GET /payroll/summary
// endpoints accept, leaving out anything that is empty so the backend's own defaults apply.
function filterQuery(filters: PayrollListFilters): string {
  const params = new URLSearchParams();
  if (filters.organizationId) params.set('organizationId', filters.organizationId);
  if (filters.workerId) params.set('workerId', filters.workerId);
  if (filters.employeeId) params.set('employeeId', filters.employeeId);
  if (filters.status) params.set('status', filters.status);
  if (filters.wageType) params.set('wageType', filters.wageType);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const payrollApi = {
  // Preview only — nothing is persisted. The backend computes every attendance and monetary
  // figure; this call never trusts a frontend-submitted total.
  calculate: (body: PayrollCalculateRequest): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>('/payroll/calculate', body),

  create: (body: PayrollRequest): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>('/payroll', body),

  list: (filters: PayrollListFilters, page = 1, limit = 20): Promise<PayrollPageResponse> =>
    apiClient.get<PayrollPageResponse>(`/payroll${filterQuery(filters)}`, {
      headers: { 'x-page': String(page), 'x-limit': String(limit) },
    }),

  getById: (id: string): Promise<PayrollResponse> =>
    apiClient.get<PayrollResponse>(`/payroll/${id}`),

  update: (id: string, body: PayrollRequest): Promise<PayrollResponse> =>
    apiClient.put<PayrollResponse>(`/payroll/${id}`, body),

  process: (id: string): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>(`/payroll/${id}/process`),

  approve: (id: string): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>(`/payroll/${id}/approve`),

  markPaid: (id: string): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>(`/payroll/${id}/mark-paid`),

  cancel: (id: string): Promise<PayrollResponse> =>
    apiClient.post<PayrollResponse>(`/payroll/${id}/cancel`),

  history: (workerId: string): Promise<PayrollResponse[]> =>
    apiClient.get<PayrollResponse[]>(`/payroll/worker/${workerId}`),

  summary: (filters: PayrollListFilters): Promise<PayrollSummary> =>
    apiClient.get<PayrollSummary>(`/payroll/summary${filterQuery(filters)}`),
};
