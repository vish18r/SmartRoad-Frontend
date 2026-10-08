import { apiClient } from './api-client';
import type {
  ShiftAssignmentListFilters,
  ShiftAssignmentPageResponse,
  ShiftAssignmentRequest,
  ShiftAssignmentResponse,
  ShiftListFilters,
  ShiftPageResponse,
  ShiftRequest,
  ShiftResponse,
  ShiftSummary,
} from '@/types/shift';

// Builds a query string from the filters the backend's GET /shifts endpoint accepts, leaving out
// anything that is empty so the backend's own defaults apply.
function shiftFilterQuery(filters: ShiftListFilters): string {
  const params = new URLSearchParams();
  if (filters.organizationId) params.set('organizationId', filters.organizationId);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  return query ? `?${query}` : '';
}

// Builds a query string from the filters the backend's GET /shifts/assignments endpoint accepts.
function assignmentFilterQuery(filters: ShiftAssignmentListFilters): string {
  const params = new URLSearchParams();
  if (filters.organizationId) params.set('organizationId', filters.organizationId);
  if (filters.workerId) params.set('workerId', filters.workerId);
  if (filters.shiftId) params.set('shiftId', filters.shiftId);
  if (filters.status) params.set('status', filters.status);
  if (filters.effectiveDate) params.set('effectiveDate', filters.effectiveDate);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const shiftApi = {
  create: (body: ShiftRequest): Promise<ShiftResponse> =>
    apiClient.post<ShiftResponse>('/shifts', body),

  list: (filters: ShiftListFilters, page = 1, limit = 20): Promise<ShiftPageResponse> =>
    apiClient.get<ShiftPageResponse>(`/shifts${shiftFilterQuery(filters)}`, {
      headers: { 'x-page': String(page), 'x-limit': String(limit) },
    }),

  summary: (organizationId?: string): Promise<ShiftSummary> =>
    apiClient.get<ShiftSummary>(`/shifts/summary${organizationId ? `?organizationId=${organizationId}` : ''}`),

  getById: (id: string): Promise<ShiftResponse> =>
    apiClient.get<ShiftResponse>(`/shifts/${id}`),

  update: (id: string, body: ShiftRequest): Promise<ShiftResponse> =>
    apiClient.put<ShiftResponse>(`/shifts/${id}`, body),

  updateStatus: (id: string, status: 'active' | 'inactive'): Promise<ShiftResponse> =>
    apiClient.patch<ShiftResponse>(`/shifts/${id}/status`, { status }),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/shifts/${id}`),

  createAssignment: (body: ShiftAssignmentRequest): Promise<ShiftAssignmentResponse> =>
    apiClient.post<ShiftAssignmentResponse>('/shifts/assignments', body),

  listAssignments: (filters: ShiftAssignmentListFilters, page = 1, limit = 20): Promise<ShiftAssignmentPageResponse> =>
    apiClient.get<ShiftAssignmentPageResponse>(`/shifts/assignments${assignmentFilterQuery(filters)}`, {
      headers: { 'x-page': String(page), 'x-limit': String(limit) },
    }),

  getAssignmentById: (id: string): Promise<ShiftAssignmentResponse> =>
    apiClient.get<ShiftAssignmentResponse>(`/shifts/assignments/${id}`),

  updateAssignment: (id: string, body: ShiftAssignmentRequest): Promise<ShiftAssignmentResponse> =>
    apiClient.put<ShiftAssignmentResponse>(`/shifts/assignments/${id}`, body),

  // Ends the assignment rather than deleting it — the backend preserves every assignment row as
  // history and closes it out (effectiveTo + status ENDED) instead of removing it.
  endAssignment: (id: string): Promise<ShiftAssignmentResponse> =>
    apiClient.delete<ShiftAssignmentResponse>(`/shifts/assignments/${id}`),

  // Resolves the shift a worker is assigned to as of a date (defaults to today on the backend).
  currentForWorker: (workerId: string, date?: string): Promise<ShiftAssignmentResponse | null> =>
    apiClient.get<ShiftAssignmentResponse | null>(`/workers/${workerId}/shift${date ? `?date=${date}` : ''}`),

  historyForWorker: (workerId: string): Promise<ShiftAssignmentResponse[]> =>
    apiClient.get<ShiftAssignmentResponse[]>(`/workers/${workerId}/shift/history`),
};
