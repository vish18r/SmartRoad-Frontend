export interface HealthStatusResponse {
  status: string;
  timestamp?: string;
  version?: string;
  database?: string;
  cache?: string;
  message?: string;
}

export type HealthStatus = HealthStatusResponse;
