import { apiClient } from './api-client';
import type {
  WorkerResponse,
  WorkerCreateRequest,
  WorkerUpdateRequest,
  AttendanceResponse,
  AttendanceCreateRequest,
} from '@/types/worker';

export const workerApi = {
  // Worker CRUD
  create: (body: WorkerCreateRequest): Promise<WorkerResponse> =>
    apiClient.post<WorkerResponse>('/workers', body),

  // Note: the backend's /workers list endpoint returns a flat array — pagination is not
  // implemented, and it reads no x-project-id header: the roster is scoped to the caller's
  // organization. To list one site's workers use listBySite() in workers-api instead.
  list: (page: number = 1, limit: number = 20): Promise<WorkerResponse[]> =>
    apiClient.get<WorkerResponse[]>('/workers', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
      },
    }),

  getById: (id: string): Promise<WorkerResponse> =>
    apiClient.get<WorkerResponse>(`/workers/${id}`),

  update: (id: string, body: WorkerUpdateRequest): Promise<WorkerResponse> =>
    apiClient.put<WorkerResponse>(`/workers/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/workers/${id}`),

  // Attendance
  markAttendance: (body: AttendanceCreateRequest): Promise<AttendanceResponse> =>
    apiClient.post<AttendanceResponse>('/workers/attendance', body),

  getAttendance: (workerId: string, month: string): Promise<AttendanceResponse[]> =>
    apiClient.get<AttendanceResponse[]>(`/workers/${workerId}/attendance`, {
      headers: { 'x-month': month },
    }),

  // Search & Filter
  search: (query: string): Promise<WorkerResponse[]> =>
    apiClient.get<WorkerResponse[]>('/workers/search', {
      headers: { 'x-search': query },
    }),

  // Legacy methods
  getList: (): Promise<WorkerResponse[]> =>
    workerApi.list(1, 1000),

  remove: (id: string): Promise<null> =>
    workerApi.delete(id),
};
