export interface DashboardStats {
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalBudget?: number;
  actualCost?: number;
  totalRoads?: number;
  completedRoads?: number;
  totalWorkers?: number;
  activeWorkers?: number;
  projectsData?: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp?: string;
  }>;
}

export type Dashboard = DashboardData;
