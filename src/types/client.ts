export interface ClientResponse {
  id: string;
  organizationId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  gstNumber?: string;
  address?: string;
  active: boolean;
}

// Mirrors ClientRequestDTO, used for both create and update. organizationId is
// @NotNull and is read from the BODY — ClientService uses request.organizationId()
// and the controller's query parameter of the same name is ignored, so it has to
// be sent here even though the URL also carries it.
export interface ClientCreateRequest {
  organizationId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  gstNumber?: string;
  address?: string;
}

export type ClientUpdateRequest = ClientCreateRequest;

export type Client = ClientResponse;
export type ClientRequest = ClientCreateRequest | ClientUpdateRequest;
