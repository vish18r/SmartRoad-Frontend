import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { HealthStatusResponse } from "@/types/health";

export type HealthStatus = HealthStatusResponse;

export const healthApi = {
  getStatus: (): Promise<ApiResponse<HealthStatusResponse>> =>
    apiClient.get<HealthStatusResponse>("/health"),
};
