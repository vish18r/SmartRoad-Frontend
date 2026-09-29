import { apiClient } from "./api-client";

export interface SiteDiaryEntry {
  id: string;
  projectId: string;
  diaryDate: string;
  weather?: string;
  temperatureCelsius?: number;
  siteConditions?: string;
  workSummary?: string;
  issues?: string;
  safetyNotes?: string;
  notes?: string;
  dateCreated?: string;
  dateModified?: string;
}

export interface SiteDiaryRequest {
  projectId: string;
  diaryDate: string;
  weather?: string;
  temperatureCelsius?: number;
  siteConditions?: string;
  workSummary?: string;
  issues?: string;
  safetyNotes?: string;
  notes?: string;
}

export const siteDiaryApi = {
  getEntries: (projectId: string): Promise<SiteDiaryEntry[]> =>
    apiClient.get<SiteDiaryEntry[]>(`/site-diary?projectId=${projectId}`),

  getEntry: (projectId: string, date: string): Promise<SiteDiaryEntry> =>
    apiClient.get<SiteDiaryEntry>(`/site-diary/entry?projectId=${projectId}&date=${date}`),

  saveEntry: (data: SiteDiaryRequest): Promise<SiteDiaryEntry> =>
    apiClient.post<SiteDiaryEntry>("/site-diary", data),

  deleteEntry: (id: string): Promise<void> =>
    apiClient.delete<void>(`/site-diary/${id}`),
};
