import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { DashboardStats, DashboardData } from "@/types/dashboard";

export const dashboardApi = {
  getStats: (): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>("/dashboard/stats"),

  getData: (): Promise<ApiResponse<DashboardData>> =>
    apiClient.get<DashboardData>("/dashboard"),

  getProjectStats: (organizationId: string): Promise<ApiResponse<DashboardStats>> =>
    apiClient.get<DashboardStats>(`/dashboard/projects?organizationId=${organizationId}`),
};
