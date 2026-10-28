import { apiClient } from './api-client';
import type { MachineStatus } from '@/types/machine';
import type {
  MachineUtilizationSummary,
  MachineUtilizationPageResponse,
  MachineUtilizationDetail,
  ProjectMachineUsage,
  MachineUsageHistoryResponse,
} from '@/types/machine-utilization';

export const machineUtilizationApi = {
  // GET /api/machine-utilization/summary?startDate&endDate&projectId
  getSummary: (params: {
    startDate: string;
    endDate: string;
    projectId?: string;
  }): Promise<MachineUtilizationSummary> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    if (params.projectId) query.set('projectId', params.projectId);
    return apiClient.get<MachineUtilizationSummary>(`/machine-utilization/summary?${query.toString()}`);
  },

  // GET /api/machine-utilization?startDate&endDate&projectId&machineId&machineType&status&page&size
  list: (params: {
    startDate: string;
    endDate: string;
    projectId?: string;
    machineId?: string;
    machineType?: string;
    status?: MachineStatus;
    page?: number;
    size?: number;
  }): Promise<MachineUtilizationPageResponse> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.machineId) query.set('machineId', params.machineId);
    if (params.machineType) query.set('machineType', params.machineType);
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return apiClient.get<MachineUtilizationPageResponse>(`/machine-utilization?${query.toString()}`);
  },

  // GET /api/machine-utilization/{machineId}
  getById: (machineId: string, params: { startDate: string; endDate: string }): Promise<MachineUtilizationDetail> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    return apiClient.get<MachineUtilizationDetail>(`/machine-utilization/${machineId}?${query.toString()}`);
  },

  // GET /api/machine-utilization/projects?startDate&endDate
  getProjectUsage: (params: { startDate: string; endDate: string }): Promise<ProjectMachineUsage[]> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    return apiClient.get<ProjectMachineUsage[]>(`/machine-utilization/projects?${query.toString()}`);
  },

  // GET /api/machines/{machineId}/usage
  getUsageHistory: (
    machineId: string,
    params: { startDate: string; endDate: string; page?: number; size?: number }
  ): Promise<MachineUsageHistoryResponse> => {
    const query = new URLSearchParams();
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return apiClient.get<MachineUsageHistoryResponse>(`/machines/${machineId}/usage?${query.toString()}`);
  },
};
