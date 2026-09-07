export interface BusinessContact {
  id: string;
  businessProfileId: string;
  contactName: string;
  contactRole: 'main_founder' | 'additional_contact';
  phoneNumber1?: string;
  phoneNumber2?: string;
}

export interface BusinessService {
  id: string;
  businessProfileId: string;
  serviceName: string;
}

export interface BusinessProfileResponse {
  id: string;
  organizationId: string;
  businessName: string;
  businessType?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPinCode?: string;
}

export interface CompleteBusinessProfileResponse {
  id: string;
  organizationId: string;
  businessName: string;
  businessType?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPinCode?: string;
  contacts: BusinessContact[];
  services: BusinessService[];
}

export interface BusinessProfileCreateRequest {
  organizationId: string;
  businessName: string;
  businessType?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPinCode?: string;
}

export interface BusinessProfileUpdateRequest {
  businessName?: string;
  businessType?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPinCode?: string;
}

export interface BusinessContactCreateRequest {
  businessProfileId: string;
  contactName: string;
  contactRole: 'main_founder' | 'additional_contact';
  phoneNumber1?: string;
  phoneNumber2?: string;
}

export interface BusinessContactUpdateRequest {
  contactName?: string;
  contactRole?: 'main_founder' | 'additional_contact';
  phoneNumber1?: string;
  phoneNumber2?: string;
}

export interface BusinessServiceCreateRequest {
  businessProfileId: string;
  serviceName: string;
}

export interface BusinessServiceUpdateRequest {
  serviceName?: string;
}

export type BusinessProfile = BusinessProfileResponse;
export type CompleteBusinessProfile = CompleteBusinessProfileResponse;
