import type { ApiError, ApiResponse } from "@/types/api";
import { tokenStorage } from "@/lib/auth/token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type RequestOptions = Omit<RequestInit, "method" | "body"> & { body?: unknown };
let refreshPromise: Promise<boolean> | null = null;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return { success: response.ok, message: "", data: null };
  try {
    return JSON.parse(text);
  } catch {
    return { success: response.ok, message: text, data: null };
  }
}

function toError(status: number, payload: unknown): ApiError {
  const response = payload as Partial<ApiResponse<Record<string, string>>>;
  const rawMessage = response.message || (status === 0 ? "Unable to reach the server. Please try again." : "Request failed.");

  // Hide technical database/server errors from users
  const isTechnicalError = rawMessage.includes("transaction") || rawMessage.includes("database") || rawMessage.includes("SQL") || rawMessage.includes("Hibernate");
  const userMessage = isTechnicalError ? "Something went wrong. Please try again." : rawMessage;

  return {
    status,
    message: userMessage,
    errors: typeof response.data === "object" && response.data !== null ? response.data : undefined,
  };
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  const baseUrl = getBaseUrl();
  if (!baseUrl || !refreshToken) return false;
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }) });
    if (!response.ok) return false;
    const payload = await readPayload(response) as { accessToken?: string };
    if (!payload.accessToken) return false;
    tokenStorage.setAccessToken(payload.accessToken);
    return true;
  } catch { return false; }
}

// Success responses are returned by the backend as the raw DTO body (never enveloped);
// only error responses are wrapped as { success, message, data } by GlobalExceptionHandler.
async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) throw { status: 0, message: "NEXT_PUBLIC_API_BASE_URL is not configured." } satisfies ApiError;
  const { body, headers, ...init } = options;
  try {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${baseUrl}${path}`, { ...init, method, credentials: "include", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    const payload = await readPayload(response);
    if (response.status === 401 && !retried && path !== "/auth/refresh") {
      refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
      if (await refreshPromise) return request<T>(method, path, options, true);
      tokenStorage.clear();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("smartroad:unauthorized"));
    }
    if (!response.ok) throw toError(response.status, payload);
    return payload as T;
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error) throw error;
    throw { status: 0, message: "Unable to reach the server. Please check your connection." } satisfies ApiError;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
