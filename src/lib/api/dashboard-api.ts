import { apiClient } from "./api-client";
import type { DashboardStats, DashboardData } from "@/types/dashboard";

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>("/dashboard/stats"),

  getData: (): Promise<DashboardData> =>
    apiClient.get<DashboardData>("/dashboard"),

  getProjectStats: (organizationId: string): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>(`/dashboard/projects?organizationId=${organizationId}`),
};
