export interface OrganizationResponse {
  id: string;
  name: string;
  legalName?: string;
  gstNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
  active: boolean;
}

export interface OrganizationCreateRequest {
  name: string;
  legalName?: string;
  gstNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
}

export interface OrganizationUpdateRequest {
  name?: string;
  legalName?: string;
  gstNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
}

export interface OrganizationMemberResponse {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  joinedDate?: string;
}

export interface OrganizationMemberCreateRequest {
  userId: string;
  role: string;
}

export type Organization = OrganizationResponse;
export type OrganizationRequest = OrganizationCreateRequest | OrganizationUpdateRequest;
