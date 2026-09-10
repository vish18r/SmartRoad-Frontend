import { apiClient } from "./api-client";
import type { DashboardStats, DashboardData, OwnerDashboard } from "@/types/dashboard";
import type { SiteDashboardResponse } from "@/types/site-dashboard";

export const dashboardApi = {
  // Supervisor view of one site on one day. `date` is ISO yyyy-MM-dd and defaults
  // to today on the backend when omitted.
  getSiteDashboard: (projectId: string, date?: string): Promise<SiteDashboardResponse> =>
    apiClient.get<SiteDashboardResponse>(
      `/dashboard/site?projectId=${projectId}${date ? `&date=${date}` : ""}`
    ),

  getOwnerDashboard: (organizationId: string): Promise<OwnerDashboard> =>
    apiClient.get<OwnerDashboard>(`/dashboard/owner?organizationId=${organizationId}`),

  getStats: (): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>("/dashboard/stats"),

  getData: (): Promise<DashboardData> =>
    apiClient.get<DashboardData>("/dashboard"),

  getProjectStats: (organizationId: string): Promise<DashboardStats> =>
    apiClient.get<DashboardStats>(`/dashboard/projects?organizationId=${organizationId}`),
};
