import { apiClient } from "./api-client";
import type { ClientResponse, ClientCreateRequest, ClientUpdateRequest } from "@/types/client";

export const clientsApi = {
  create: (organizationId: string, body: ClientCreateRequest): Promise<ClientResponse> =>
    apiClient.post<ClientResponse>(`/clients?organizationId=${organizationId}`, body),

  list: (organizationId: string): Promise<ClientResponse[]> =>
    apiClient.get<ClientResponse[]>(`/clients?organizationId=${organizationId}`),

  getById: (id: string, organizationId: string): Promise<ClientResponse> =>
    apiClient.get<ClientResponse>(`/clients/${id}?organizationId=${organizationId}`),

  update: (id: string, organizationId: string, body: ClientUpdateRequest): Promise<ClientResponse> =>
    apiClient.put<ClientResponse>(`/clients/${id}?organizationId=${organizationId}`, body),

  delete: (id: string, organizationId: string): Promise<null> =>
    apiClient.delete<null>(`/clients/${id}?organizationId=${organizationId}`),
};
