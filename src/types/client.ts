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

export interface ClientCreateRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  gstNumber?: string;
  address?: string;
}

export interface ClientUpdateRequest {
  name?: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  gstNumber?: string;
  address?: string;
}

export type Client = ClientResponse;
export type ClientRequest = ClientCreateRequest | ClientUpdateRequest;
