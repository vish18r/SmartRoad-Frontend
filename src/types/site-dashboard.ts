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

export interface SiteDashboardResponse {
  projectId: string;
  projectName: string;
  projectCode?: string;
  date: string;
  work: SiteWork;
  workforce: SiteWorkforce;
  materials: SiteMaterials;
  photos: SitePhotos;
}
