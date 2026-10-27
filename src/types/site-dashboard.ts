// Mirrors SiteDashboardResponseDTO — the supervisor's view of one site on one day.

export interface SiteWork {
  projectStatus: string;
  projectProgress: number;
  totalRoads: number;
  completedRoads: number;
  totalLengthM: number;
  completedLengthM: number;
  remainingLengthM: number;
  completionPercentage: number;
}

export interface SiteWorkforce {
  assignedWorkers: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  marked: number;
  checkedIn: number;
  checkedOut: number;
  stillOnSite: number;
  hoursWorked: number;
}

export interface SiteMaterials {
  trackedMaterials: number;
  lowStockMaterials: number;
  stockValue: number;
}

export interface SitePhoto {
  id: string;
  photoType: string;
  photoUrl: string;
  photoDate: string;
  workArea?: string;
  description?: string;
}

export interface SitePhotos {
  photosToday: number;
  recent: SitePhoto[];
}

export interface SiteDiarySummary {
  id: string;
  diaryDate: string;
  weather?: string;
  temperatureCelsius?: number;
  siteConditions?: string;
  workSummary?: string;
  issues?: string;
  safetyNotes?: string;
  notes?: string;
}

export interface SiteMaterialsToday {
  receivedQuantity: number;
  consumedQuantity: number;
}

export type SiteActivityEventType =
  | "CHECK_IN"
  | "CHECK_OUT"
  | "MATERIAL_RECEIVED"
  | "MATERIAL_CONSUMED"
  | "MATERIAL_TRANSFER"
  | "PHOTO_UPLOADED"
  | "DIARY_UPDATED";

export interface SiteActivityEvent {
  id: string;
  type: SiteActivityEventType;
  description: string;
  timestamp: string;
  actorId?: string;
}

export interface SiteDashboardResponse {
  projectId: string;
  projectName: string;
  projectCode?: string;
  date: string;
  work: SiteWork;
  workforce: SiteWorkforce;
  materials: SiteMaterials;
  photos: SitePhotos;
  // Added alongside the diary/materials-today/activity feed — optional so a
  // slightly-behind backend deploy or a stale cached response doesn't crash the page.
  diary?: SiteDiarySummary | null;
  materialsToday?: SiteMaterialsToday;
  activity?: SiteActivityEvent[];
}
