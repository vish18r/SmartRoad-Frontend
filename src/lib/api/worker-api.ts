import { apiClient } from './api-client';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import type {
  WorkerResponse,
  WorkerCreateRequest,
  WorkerUpdateRequest,
  AttendanceResponse,
  AttendanceCreateRequest,
} from '@/types/worker';

export const workerApi = {
  // Worker CRUD
  create: (body: WorkerCreateRequest): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.post<WorkerResponse>('/workers', body),

  list: (projectId?: string, page: number = 1, limit: number = 20): Promise<ApiResponse<ApiListResponse<WorkerResponse>>> =>
    apiClient.get<ApiListResponse<WorkerResponse>>('/workers', {
      headers: {
        'x-page': String(page),
        'x-limit': String(limit),
        ...(projectId && { 'x-project-id': projectId }),
      },
    }),

  getById: (id: string): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.get<WorkerResponse>(`/workers/${id}`),

  update: (id: string, body: WorkerUpdateRequest): Promise<ApiResponse<WorkerResponse>> =>
    apiClient.put<WorkerResponse>(`/workers/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/workers/${id}`),

  // Attendance
  markAttendance: (body: AttendanceCreateRequest): Promise<ApiResponse<AttendanceResponse>> =>
    apiClient.post<AttendanceResponse>('/workers/attendance', body),

  getAttendance: (workerId: string, month: string): Promise<ApiResponse<AttendanceResponse[]>> =>
    apiClient.get<AttendanceResponse[]>(`/workers/${workerId}/attendance`, {
      headers: { 'x-month': month },
    }),

  // Search & Filter
  search: (query: string): Promise<ApiResponse<WorkerResponse[]>> =>
    apiClient.get<WorkerResponse[]>('/workers/search', {
      headers: { 'x-search': query },
    }),

  // Legacy methods
  getList: (projectId?: string): Promise<ApiResponse<WorkerResponse[]>> =>
    workerApi.list(projectId, 1, 1000),

  remove: (id: string): Promise<ApiResponse<null>> =>
    workerApi.delete(id),
};
