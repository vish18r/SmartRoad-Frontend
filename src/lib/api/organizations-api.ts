import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type {
  OrganizationResponse,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
  OrganizationMemberResponse,
  OrganizationMemberCreateRequest,
} from "@/types/organization";

export const organizationsApi = {
  create: (body: OrganizationCreateRequest): Promise<ApiResponse<OrganizationResponse>> =>
    apiClient.post<OrganizationResponse>("/organizations", body),

  list: (): Promise<ApiResponse<OrganizationResponse[]>> =>
    apiClient.get<OrganizationResponse[]>("/organizations"),

  getMyOrganizations: (): Promise<ApiResponse<OrganizationResponse[]>> =>
    apiClient.get<OrganizationResponse[]>("/organizations/my-organizations"),

  getById: (id: string): Promise<ApiResponse<OrganizationResponse>> =>
    apiClient.get<OrganizationResponse>(`/organizations/${id}`),

  update: (id: string, body: OrganizationUpdateRequest): Promise<ApiResponse<OrganizationResponse>> =>
    apiClient.put<OrganizationResponse>(`/organizations/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/organizations/${id}`),

  addMember: (
    organizationId: string,
    body: OrganizationMemberCreateRequest
  ): Promise<ApiResponse<OrganizationMemberResponse>> =>
    apiClient.post<OrganizationMemberResponse>(`/organizations/${organizationId}/members`, body),

  listMembers: (organizationId: string): Promise<ApiResponse<OrganizationMemberResponse[]>> =>
    apiClient.get<OrganizationMemberResponse[]>(`/organizations/${organizationId}/members`),

  removeMember: (organizationId: string, memberId: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/organizations/${organizationId}/members/${memberId}`),
};
