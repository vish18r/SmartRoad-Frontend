import { apiClient } from "./api-client";
import type {
  OrganizationResponse,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
  OrganizationMemberResponse,
  OrganizationMemberCreateRequest,
} from "@/types/organization";

export const organizationsApi = {
  create: (body: OrganizationCreateRequest): Promise<OrganizationResponse> =>
    apiClient.post<OrganizationResponse>("/organizations", body),

  list: (): Promise<OrganizationResponse[]> =>
    apiClient.get<OrganizationResponse[]>("/organizations"),

  getMyOrganizations: (): Promise<OrganizationResponse[]> =>
    apiClient.get<OrganizationResponse[]>("/organizations/my-organizations"),

  getById: (id: string): Promise<OrganizationResponse> =>
    apiClient.get<OrganizationResponse>(`/organizations/${id}`),

  update: (id: string, body: OrganizationUpdateRequest): Promise<OrganizationResponse> =>
    apiClient.put<OrganizationResponse>(`/organizations/${id}`, body),

  delete: (id: string): Promise<null> =>
    apiClient.delete<null>(`/organizations/${id}`),

  addMember: (
    organizationId: string,
    body: OrganizationMemberCreateRequest
  ): Promise<OrganizationMemberResponse> =>
    apiClient.post<OrganizationMemberResponse>(`/organizations/${organizationId}/members`, body),

  listMembers: (organizationId: string): Promise<OrganizationMemberResponse[]> =>
    apiClient.get<OrganizationMemberResponse[]>(`/organizations/${organizationId}/members`),

  removeMember: (organizationId: string, memberId: string): Promise<null> =>
    apiClient.delete<null>(`/organizations/${organizationId}/members/${memberId}`),
};
