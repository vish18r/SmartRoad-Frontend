import type { PaginationMeta } from '@/types/common';
import type { MachineStatus } from '@/types/machine';

// All metrics below are `number | null`: the backend returns null (never a
// fabricated 0) when the underlying usage/fuel/maintenance records needed to
// compute that metric don't exist yet. The UI must render a clear
// "not recorded"/"unavailable" state for every null, never a dash or 0.

export type ReportingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

// Mirrors MachineUtilizationSummaryDTO — GET /api/machine-utilization/summary
export interface MachineUtilizationSummary {
  periodStart?: string;
  periodEnd?: string;
  totalMachines?: number | null;
  totalRunningHours: number | null;
  totalIdleHours: number | null;
  totalAvailableHours: number | null;
  utilizationPercentage: number | null;
  totalFuelConsumed: number | null; // litres
  totalFuelCost: number | null;
  totalMaintenanceCost: number | null;
  averageCostPerHour: number | null;
}

// One row of GET /api/machine-utilization (mirrors MachineUtilizationListItemDTO)
export interface MachineUtilizationListItem {
  machineId: string;
  machineName: string;
  machineType?: string | null;
  status?: MachineStatus | null;
  projectId?: string | null;
  projectName?: string | null;
  runningHours: number | null;
  idleHours: number | null;
  availableHours: number | null;
  utilizationPercentage: number | null;
  fuelConsumed: number | null;
  fuelCost: number | null;
  maintenanceCost: number | null;
  operatingCostPerHour: number | null;
}

export interface MachineUtilizationPageResponse {
  items: MachineUtilizationListItem[];
  pagination: PaginationMeta;
}

// GET /api/machine-utilization/projects?startDate&endDate
export interface ProjectMachineUsage {
  projectId: string;
  projectName: string;
  machineCount?: number | null;
  totalRunningHours: number | null;
  totalIdleHours: number | null;
  utilizationPercentage: number | null;
  totalFuelConsumed: number | null;
  totalMaintenanceCost: number | null;
}

// One entry of GET /api/machines/{machineId}/usage (mirrors MachineUsageHistoryDTO)
export interface MachineUsageHistoryEntry {
  id: string;
  date: string;
  projectId?: string | null;
  projectName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  runningHours: number | null;
  idleHours: number | null;
  fuelConsumed: number | null;
  operatorName?: string | null;
  notes?: string | null;
}

export interface MachineUsageHistoryResponse {
  items: MachineUsageHistoryEntry[];
  pagination: PaginationMeta;
}

// A maintenance record as surfaced on the machine utilization detail DTO.
// There is no dedicated maintenance-history endpoint in this contract yet, so
// the detail endpoint is expected to embed recent records here (nullable array
// — absent/empty while the maintenance module has nothing recorded for this machine).
export interface MachineMaintenanceRecord {
  id: string;
  date: string;
  type?: string | null;
  description?: string | null;
  cost: number | null;
  performedBy?: string | null;
}

// GET /api/machine-utilization/{machineId}
export interface MachineUtilizationDetail extends MachineUtilizationListItem {
  registrationNumber?: string | null;
  projectUsage: ProjectMachineUsage[] | null;
  maintenanceHistory: MachineMaintenanceRecord[] | null;
}

export interface MachineUtilizationFilters {
  startDate: string;
  endDate: string;
  projectId?: string;
  machineId?: string;
  machineType?: string;
  status?: MachineStatus;
  page?: number;
  size?: number;
}
