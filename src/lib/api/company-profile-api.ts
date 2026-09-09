import { apiClient } from "./api-client";
import type { CompanyProfile } from "@/types/company";

export const companyProfileApi = {
  getPublicProfile: (): Promise<CompanyProfile> =>
    apiClient.get<CompanyProfile>("/public/company-profile"),
};
