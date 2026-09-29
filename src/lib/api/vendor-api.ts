import { apiClient } from "./api-client";

export interface VendorResponse {
  id: string;
  organizationId: string;
  vendorName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstNumber?: string;
  vendorType?: string;
  paymentTerms?: string;
  isActive?: boolean;
  createdDate?: string;
}

export interface VendorRequest {
  vendorName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstNumber?: string;
  vendorType?: string;
  paymentTerms?: string;
}

export const vendorApi = {
  list: (organizationId: string): Promise<VendorResponse[]> =>
    apiClient.get<VendorResponse[]>(`/vendors?organizationId=${organizationId}`),

  getById: (id: string): Promise<VendorResponse> =>
    apiClient.get<VendorResponse>(`/vendors/${id}`),

  create: (organizationId: string, body: VendorRequest): Promise<VendorResponse> =>
    apiClient.post<VendorResponse>("/vendors", { ...body, organizationId }),

  update: (id: string, body: VendorRequest): Promise<VendorResponse> =>
    apiClient.put<VendorResponse>(`/vendors/${id}`, body),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/vendors/${id}`),
};
