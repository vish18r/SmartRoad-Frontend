import { apiClient } from "./api-client";
import type { DashboardStats, DashboardData, OwnerDashboard } from "@/types/dashboard";

export const dashboardApi = {
  getOwnerDashboard: (organizationId: string): Promise<OwnerDashboard> =>
    apiClient.get<OwnerDashboard>(`/dashboard/owner?organizationId=${organizationId}`),

  getStats: (): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>("/dashboard/stats"),

  getData: (): Promise<DashboardData> =>
    apiClient.get<DashboardData>("/dashboard"),

  getProjectStats: (organizationId: string): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>(`/dashboard/projects?organizationId=${organizationId}`),
};
