import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";

export interface HealthStatus {
  status: string;
}

export const healthApi = {
  getStatus: (): Promise<ApiResponse<HealthStatus>> => apiClient.get<HealthStatus>("/health"),
};
