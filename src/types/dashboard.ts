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

export interface OwnerDashboard {
  portfolio: {
    totalProjects: number;
    activeProjects: number;
    onHoldProjects: number;
    completedProjects: number;
    averageProgress: number;
  };
  contracts: {
    totalContracts: number;
    activeContracts: number;
    totalContractValue: number;
    activeContractValue: number;
  };
  financials: {
    totalBudget: number;
    totalActualCost: number;
    budgetVariance: number;
    overBudgetProjects: number;
    committedProcurement: number;
    procurementAwaitingDelivery: number;
  };
  deadlines: {
    overdueProjects: number;
    projectsDueIn30Days: number;
    contractsExpiringIn30Days: number;
    deliveriesOverdue: number;
  };
}
