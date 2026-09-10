import { apiClient } from "./api-client";
import type { ClientResponse, ClientCreateRequest, ClientUpdateRequest } from "@/types/client";

// Create and update read organizationId from the request BODY (ClientService uses
// request.organizationId()), while list/get/delete read it from the query string.
// The query parameter is therefore sent on every call for consistency, but for
// create and update the body value is the one that takes effect.
export const clientsApi = {
  create: (organizationId: string, body: ClientCreateRequest): Promise<ClientResponse> =>
    apiClient.post<ClientResponse>(`/clients?organizationId=${organizationId}`, {
      ...body,
      organizationId,
    }),

  list: (organizationId: string): Promise<ClientResponse[]> =>
    apiClient.get<ClientResponse[]>(`/clients?organizationId=${organizationId}`),

  getById: (id: string, organizationId: string): Promise<ClientResponse> =>
    apiClient.get<ClientResponse>(`/clients/${id}?organizationId=${organizationId}`),

  update: (id: string, organizationId: string, body: ClientUpdateRequest): Promise<ClientResponse> =>
    apiClient.put<ClientResponse>(`/clients/${id}?organizationId=${organizationId}`, {
      ...body,
      organizationId,
    }),

  delete: (id: string, organizationId: string): Promise<null> =>
    apiClient.delete<null>(`/clients/${id}?organizationId=${organizationId}`),
};
