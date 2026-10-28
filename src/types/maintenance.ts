import type { BaseEntity, PaginationMeta } from '@/types/common';

// Wire values come from the backend maintenance enums (MaintenanceTypeEnum etc.), which
// implement EnumValueHandler with a lowercase @JsonValue — so they serialise lowercase.
// Requests may send either form (the backend matches case-insensitively); we always send lowercase.
export type MaintenanceType = 'preventive' | 'corrective';

export type MaintenanceCategory =
  | 'scheduled_servicing'
  | 'oil_filter_change'
  | 'routine_inspection'
  | 'lubrication'
  | 'scheduled_part_replacement'
  | 'breakdown'
  | 'equipment_repair'
  | 'fault_diagnosis'
  | 'part_replacement'
  | 'emergency_maintenance'
  | 'other';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

// `due` and `overdue` are derived by the server on every read from the schedule and the
// current time; they are never set directly.
export type MaintenanceStatus = 'scheduled' | 'due' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export type MaintenanceRecurrence = 'one_time' | 'daily' | 'weekly' | 'monthly';

export type MaintenanceReminderType = 'created' | 'due' | 'overdue' | 'completed';

// Mirrors MaintenanceResponseDTO.
export interface MaintenanceRecord extends BaseEntity {
  organizationId: string;
  maintenanceReference: string;
  machineId: string;
  machineName?: string | null;
  machineType?: string | null;
  machineRegistrationNumber?: string | null;
  machineMaintenanceStatus?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  maintenanceType: MaintenanceType;
  category: MaintenanceCategory;
  description?: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduledStart: string;
  scheduledEnd?: string | null;
  dueBy: string;
  actualStart?: string | null;
  actualEnd?: string | null;
  reportedAt?: string | null;
  technicianWorkerId?: string | null;
  technicianName?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  // Computed server-side from actualStart/actualEnd on completion; null when not both recorded.
  downtimeMinutes?: number | null;
  partsUsed?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  recurrenceType: MaintenanceRecurrence;
  parentMaintenanceId?: string | null;
  canStart: boolean;
  canComplete: boolean;
  canCancel: boolean;
  editable: boolean;
}

// Mirrors MaintenanceRequestDTO — used for both create (POST) and update (PUT).
export interface MaintenanceRequest {
  machineId: string;
  projectId?: string;
  title: string;
  maintenanceType: MaintenanceType;
  category?: MaintenanceCategory;
  description?: string;
  priority?: MaintenancePriority;
  scheduledStart: string; // ISO-8601 with offset
  scheduledEnd?: string;
  reportedAt?: string;
  technicianWorkerId?: string;
  technicianName?: string;
  estimatedCost?: number;
  actualCost?: number;
  partsUsed?: string;
  notes?: string;
  recurrenceType?: MaintenanceRecurrence;
}

// Mirrors MaintenanceStartRequestDTO (all optional; actualStart defaults to now on the server).
export interface MaintenanceStartRequest {
  actualStart?: string;
  technicianWorkerId?: string;
  technicianName?: string;
  notes?: string;
}

// Mirrors MaintenanceCompleteRequestDTO (actualEnd defaults to now; downtime is computed server-side).
export interface MaintenanceCompleteRequest {
  actualEnd?: string;
  actualCost?: number;
  partsUsed?: string;
  notes?: string;
}

// Mirrors MaintenanceCancelRequestDTO.
export interface MaintenanceCancelRequest {
  reason?: string;
}

export interface MaintenancePageResponse {
  items: MaintenanceRecord[];
  pagination: PaginationMeta;
}

// Mirrors MaintenanceSummaryDTO — GET /maintenance/summary.
// Snapshot counts (scheduled/dueSoon/overdue/inProgress/machinesUnderMaintenance) are current
// state; the rest cover records scheduled within [periodStart, periodEnd].
export interface MaintenanceSummary {
  periodStart: string;
  periodEnd: string;
  totalMachines: number;
  scheduled: number;
  dueSoon: number;
  overdue: number;
  inProgress: number;
  machinesUnderMaintenance: number;
  totalRecords: number;
  completed: number;
  cancelled: number;
  // actual cost where recorded, else estimated cost (cancelled records excluded)
  totalCostInPeriod: number;
  actualCostInPeriod: number;
  estimatedCostFallbackInPeriod: number;
  totalDowntimeMinutesInPeriod: number;
}

// Mirrors MaintenanceReminderDTO / MaintenanceRemindersDTO — GET /maintenance/reminders.
export interface MaintenanceReminder {
  reminderType: MaintenanceReminderType;
  maintenanceId: string;
  maintenanceReference: string;
  machineId: string;
  machineName?: string | null;
  title: string;
  priority: MaintenancePriority;
  scheduledStart: string;
  dueBy: string;
  technicianName?: string | null;
  message: string;
}

export interface MaintenanceReminders {
  generatedAt: string;
  dueReminders: MaintenanceReminder[];
  overdueReminders: MaintenanceReminder[];
}

export interface MaintenanceListParams {
  organizationId?: string;
  machineId?: string;
  projectId?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  type?: MaintenanceType;
  dateFrom?: string; // yyyy-MM-dd
  dateTo?: string; // yyyy-MM-dd
  upcoming?: boolean;
  overdue?: boolean;
  page?: number;
  limit?: number;
}
