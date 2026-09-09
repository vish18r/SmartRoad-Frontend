export type CompanyContactRole = "main_founder" | "additional_contact";

export interface CompanyContact {
  id: string;
  contactName: string;
  contactRole: CompanyContactRole;
  phoneNumber1: string | null;
  phoneNumber2: string | null;
}

export interface CompanyServiceItem {
  id: string;
  serviceName: string;
  displayOrder: number;
}

/** Public company profile shape returned by GET /public/company-profile. */
export interface CompanyProfile {
  id: string;
  brandName: string;
  businessName: string;
  businessType: string;
  productName: string;
  tagline: string;
  phone: string;
  address: string;
  founder: CompanyContact | null;
  additionalContacts: CompanyContact[];
  services: CompanyServiceItem[];
}
