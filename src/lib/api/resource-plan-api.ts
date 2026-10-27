import { apiClient } from './api-client';
import type {
  ResourcePlanResponse,
  ResourcePlanRequest,
  ResourcePlanPageResponse,
  ResourcePlanDetailResponse,
  ResourcePlanSummary,
  ResourceAllocationRequest,
  ResourceAllocationResponse,
  ResourcePlanValidateRequest,
  ResourcePlanValidationResponse,
  ResourceAvailabilityResponse,
  ResourcePlanStatus,
  ResourceType,
} from '@/types/resource-plan';

export const resourcePlanApi = {
  create: (body: ResourcePlanRequest): Promise<ResourcePlanResponse> =>
    apiClient.post<ResourcePlanResponse>('/resource-planning', body),

  list: (params: {
    organizationId: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: ResourcePlanStatus;
    page?: number;
    limit?: number;
  }): Promise<ResourcePlanPageResponse> => {
    const query = new URLSearchParams();
    query.set('organizationId', params.organizationId);
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return apiClient.get<ResourcePlanPageResponse>(`/resource-planning?${query.toString()}`);
  },

  get: (id: string): Promise<ResourcePlanDetailResponse> =>
    apiClient.get<ResourcePlanDetailResponse>(`/resource-planning/${id}`),

  update: (id: string, body: ResourcePlanRequest): Promise<ResourcePlanResponse> =>
    apiClient.put<ResourcePlanResponse>(`/resource-planning/${id}`, body),

  cancel: (id: string): Promise<ResourcePlanResponse> =>
    apiClient.post<ResourcePlanResponse>(`/resource-planning/${id}/cancel`),

  // DELETE cancels the plan too (same effect as /cancel).
  delete: (id: string): Promise<ResourcePlanResponse> =>
    apiClient.delete<ResourcePlanResponse>(`/resource-planning/${id}`),

  confirm: (id: string): Promise<ResourcePlanResponse> =>
    apiClient.post<ResourcePlanResponse>(`/resource-planning/${id}/confirm`),

  getSummary: (params: { organizationId: string; projectId?: string; date?: string }): Promise<ResourcePlanSummary> => {
    const query = new URLSearchParams();
    query.set('organizationId', params.organizationId);
    if (params.projectId) query.set('projectId', params.projectId);
    if (params.date) query.set('date', params.date);
    return apiClient.get<ResourcePlanSummary>(`/resource-planning/summary?${query.toString()}`);
  },

  addAllocation: (planId: string, body: ResourceAllocationRequest): Promise<ResourceAllocationResponse> =>
    apiClient.post<ResourceAllocationResponse>(`/resource-planning/${planId}/allocations`, body),

  updateAllocation: (
    planId: string,
    allocationId: string,
    body: ResourceAllocationRequest
  ): Promise<ResourceAllocationResponse> =>
    apiClient.put<ResourceAllocationResponse>(`/resource-planning/${planId}/allocations/${allocationId}`, body),

  removeAllocation: (planId: string, allocationId: string): Promise<null> =>
    apiClient.delete<null>(`/resource-planning/${planId}/allocations/${allocationId}`),

  // Stateless conflict check — safe to call repeatedly while building a plan.
  validate: (body: ResourcePlanValidateRequest): Promise<ResourcePlanValidationResponse> =>
    apiClient.post<ResourcePlanValidationResponse>('/resource-planning/validate', body),

  getAvailability: (params: {
    projectId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    resourceType?: ResourceType;
  }): Promise<ResourceAvailabilityResponse> => {
    const query = new URLSearchParams();
    query.set('projectId', params.projectId);
    query.set('date', params.date);
    if (params.startTime) query.set('startTime', params.startTime);
    if (params.endTime) query.set('endTime', params.endTime);
    if (params.resourceType) query.set('resourceType', params.resourceType);
    return apiClient.get<ResourceAvailabilityResponse>(`/resource-planning/availability?${query.toString()}`);
  },
};
