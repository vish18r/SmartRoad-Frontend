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

// Wire values come from UserRole, whose @JsonValue equals the constant name, so
// these stay uppercase — unlike the @JsonValue enums elsewhere in the API.
export type OrganizationMemberRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'WORKER'
  | 'USER';

// Mirrors OrganizationMemberResponseDTO. The membership row's own id and
// organizationId are not exposed — a member is identified by their user ID.
export interface OrganizationMemberResponse {
  userId: string;
  role: OrganizationMemberRole;
  active: boolean;
}

// Mirrors OrganizationMemberRequestDTO. Adding a user who was previously
// removed reactivates their membership and applies the new role.
export interface OrganizationMemberCreateRequest {
  userId: string;
  role: OrganizationMemberRole;
}

export type Organization = OrganizationResponse;
export type OrganizationRequest = OrganizationCreateRequest | OrganizationUpdateRequest;
