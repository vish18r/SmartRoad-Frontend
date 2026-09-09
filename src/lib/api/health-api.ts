import { apiClient } from "./api-client";
import type { HealthStatusResponse } from "@/types/health";

export type HealthStatus = HealthStatusResponse;

// Unlike every other controller, HealthController wraps its success response
// in { success, message, data } — unwrap that here so callers get the raw status.
export const healthApi = {
  getStatus: (): Promise<HealthStatusResponse> =>
    apiClient
      .get<{ success: boolean; message: string; data: HealthStatusResponse }>("/health")
      .then((envelope) => envelope.data),
};
