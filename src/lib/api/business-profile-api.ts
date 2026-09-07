import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types/api";
import type {
  BusinessProfileResponse,
  CompleteBusinessProfileResponse,
  BusinessProfileCreateRequest,
  BusinessProfileUpdateRequest,
  BusinessContact,
  BusinessContactCreateRequest,
  BusinessContactUpdateRequest,
  BusinessService,
  BusinessServiceCreateRequest,
  BusinessServiceUpdateRequest,
} from "@/types/business-profile";

export const businessProfileApi = {
  // Business Profile CRUD
  create: (body: BusinessProfileCreateRequest): Promise<ApiResponse<BusinessProfileResponse>> =>
    apiClient.post<BusinessProfileResponse>("/business-profiles", body),

  getById: (id: string): Promise<ApiResponse<BusinessProfileResponse>> =>
    apiClient.get<BusinessProfileResponse>(`/business-profiles/${id}`),

  getByOrganization: (organizationId: string): Promise<ApiResponse<BusinessProfileResponse>> =>
    apiClient.get<BusinessProfileResponse>(`/business-profiles/organization/${organizationId}`),

  getComplete: (id: string): Promise<ApiResponse<CompleteBusinessProfileResponse>> =>
    apiClient.get<CompleteBusinessProfileResponse>(`/business-profiles/${id}/complete`),

  update: (id: string, body: BusinessProfileUpdateRequest): Promise<ApiResponse<BusinessProfileResponse>> =>
    apiClient.put<BusinessProfileResponse>(`/business-profiles/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/business-profiles/${id}`),

  // Business Contacts
  addContact: (body: BusinessContactCreateRequest): Promise<ApiResponse<BusinessContact>> =>
    apiClient.post<BusinessContact>("/business-profiles/contacts", body),

  getContacts: (profileId: string): Promise<ApiResponse<BusinessContact[]>> =>
    apiClient.get<BusinessContact[]>(`/business-profiles/${profileId}/contacts`),

  updateContact: (id: string, body: BusinessContactUpdateRequest): Promise<ApiResponse<BusinessContact>> =>
    apiClient.put<BusinessContact>(`/business-profiles/contacts/${id}`, body),

  deleteContact: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/business-profiles/contacts/${id}`),

  // Business Services
  addService: (body: BusinessServiceCreateRequest): Promise<ApiResponse<BusinessService>> =>
    apiClient.post<BusinessService>("/business-profiles/services", body),

  getServices: (profileId: string): Promise<ApiResponse<BusinessService[]>> =>
    apiClient.get<BusinessService[]>(`/business-profiles/${profileId}/services`),

  updateService: (id: string, body: BusinessServiceUpdateRequest): Promise<ApiResponse<BusinessService>> =>
    apiClient.put<BusinessService>(`/business-profiles/services/${id}`, body),

  deleteService: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/business-profiles/services/${id}`),
};
