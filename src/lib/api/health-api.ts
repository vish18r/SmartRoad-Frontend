import { apiClient } from "./api-client";
import type { HealthStatusResponse } from "@/types/health";

export type HealthStatus = HealthStatusResponse;

export const healthApi = {
  getStatus: (): Promise<HealthStatusResponse> =>
    apiClient.get<HealthStatusResponse>("/health"),
};
