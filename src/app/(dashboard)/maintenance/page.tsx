"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { maintenanceApi } from "@/lib/api/maintenance-api";
import { machineApi } from "@/lib/api/machine-api";
import { projectApi } from "@/lib/api/project-api";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { EmptyState, ErrorState } from "@/components/common/states";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { PriorityBadge, Stat, StatusBadge, inputClass } from "@/components/maintenance/maintenance-ui";
import { MaintenanceFormDialog } from "@/components/maintenance/maintenance-form";
import { MaintenanceActionDialog, type MaintenanceAction } from "@/components/maintenance/maintenance-action-dialogs";
import { MaintenanceCalendar } from "@/components/maintenance/maintenance-calendar";
import { formatINR } from "@/lib/currency";
import {
  MAINTENANCE_CATEGORY_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_PRIORITY_OPTIONS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_OPTIONS,
  MAINTENANCE_TYPE_LABELS,
  formatDateTime,
  formatDowntime,
} from "@/lib/maintenance-format";
import type { ProjectResponse } from "@/types/project";
import type { MaintenancePriority, MaintenanceRecord, MaintenanceStatus, MaintenanceType } from "@/types/maintenance";

const PAGE_SIZE = 20;

function PageHeader({ action }: { action?: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">Schedule and track preventive and corrective maintenance for machinery and equipment.</p>
      </div>
      {action}
    </div>
  );
}

function ScheduleButton({ hasMachines, onClick }: { hasMachines: boolean; onClick: () => void }) {
  if (!hasMachines) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white opacity-50" disabled title="Add a machine first">
          Schedule Maintenance
        </button>
        <Link href="/machines" className="text-xs font-medium text-orange-600 hover:underline">
          Add machines first →
        </Link>
      </div>
    );
  }
  return (
    <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700" onClick={onClick}>
      Schedule Maintenance
    </button>
  );
}

export default function MaintenancePage() {
  const router = useRouter();
  const { organizationId, projectId: workspaceProjectId } = useWorkspace();

  const [view, setView] = useState<"list" | "calendar">("list");
  const [machineId, setMachineId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState<MaintenanceType | "">("");
  const [priority, setPriority] = useState<MaintenancePriority | "">("");
  const [status, setStatus] = useState<MaintenanceStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quick, setQuick] = useState<"" | "upcoming" | "overdue">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ record: MaintenanceRecord; action: MaintenanceAction } | null>(null);

  const orgId = organizationId as string;

  const { data: summary, refetch: refetchSummary } = useApi(
    () => maintenanceApi.getSummary({ organizationId: orgId }),
    { skip: !organizationId, deps: [organizationId] }
  );
  const { data: machinePage, loading: machinesLoading } = useApi(
    () => machineApi.list({ organizationId: orgId, limit: 500 }),
    { skip: !organizationId, deps: [organizationId] }
  );
  const { data: projects } = useApi<ProjectResponse[]>(
    () => projectApi.list(orgId),
    { skip: !organizationId, deps: [organizationId] }
  );

  const {
    data: recordPage,
    loading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useApi(
    () =>
      maintenanceApi.list({
        organizationId: orgId,
        machineId: machineId || undefined,
        projectId: projectId || undefined,
        type: type || undefined,
        priority: priority || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        upcoming: quick === "upcoming",
        overdue: quick === "overdue",
        page,
        limit: PAGE_SIZE,
      }),
    {
      skip: !organizationId,
      deps: [organizationId, machineId, projectId, type, priority, status, dateFrom, dateTo, quick, page],
    }
  );

  function refreshAll() {
    refetchRecords();
    refetchSummary();
  }

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const machines = machinePage?.items ?? [];
  const hasMachines = machines.length > 0 || (summary?.totalMachines ?? 0) > 0;
  const records = recordPage?.items ?? [];
  const pagination = recordPage?.pagination;
  const filtersActive = Boolean(machineId || projectId || type || priority || status || dateFrom || dateTo || quick);
  const noRecordsAtAll = !recordsLoading && !filtersActive && records.length === 0 && page === 1;
  const term = search.trim().toLowerCase();
  const visibleRecords = term
    ? records.filter(
        (r) =>
          r.maintenanceReference.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          (r.machineName ?? "").toLowerCase().includes(term)
      )
    : records;

  const columns: TableColumn<MaintenanceRecord>[] = [
    {
      key: "reference",
      label: "Reference",
      render: (r) => (
        <div>
          <Link href={`/maintenance/${r.id}`} className="font-medium text-slate-900 hover:text-orange-600 hover:underline">
            {r.maintenanceReference}
          </Link>
          <p className="max-w-[220px] truncate text-xs text-slate-500" title={r.title}>{r.title}</p>
        </div>
      ),
    },
    {
      key: "machine",
      label: "Machine",
      render: (r) => (
        <div>
          <p className="text-slate-800">{r.machineName ?? "—"}</p>
          {r.machineRegistrationNumber && <p className="text-xs text-slate-400">{r.machineRegistrationNumber}</p>}
        </div>
      ),
    },
    { key: "project", label: "Project / Site", render: (r) => r.projectName ?? "—" },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <div>
          <p>{MAINTENANCE_TYPE_LABELS[r.maintenanceType]}</p>
          <p className="text-xs text-slate-400">{MAINTENANCE_CATEGORY_LABELS[r.category]}</p>
        </div>
      ),
    },
    { key: "scheduled", label: "Scheduled Date", render: (r) => formatDateTime(r.scheduledStart) },
    { key: "priority", label: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "estimated", label: "Estimated Cost", render: (r) => (r.estimatedCost != null ? formatINR(r.estimatedCost) : "—") },
    {
      key: "actual",
      label: "Actual Cost",
      render: (r) => (r.actualCost != null ? formatINR(r.actualCost) : <span className="italic text-slate-400">Not recorded</span>),
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="text-orange-600 hover:underline" onClick={() => router.push(`/maintenance/${r.id}`)}>View</button>
          {r.canStart && (
            <button className="text-purple-700 hover:underline" onClick={() => setPendingAction({ record: r, action: "start" })}>Start</button>
          )}
          {r.canComplete && (
            <button className="text-emerald-700 hover:underline" onClick={() => setPendingAction({ record: r, action: "complete" })}>Complete</button>
          )}
          {r.canCancel && (
            <button className="text-red-600 hover:underline" onClick={() => setPendingAction({ record: r, action: "cancel" })}>Cancel</button>
          )}
        </div>
      ),
    },
  ];

  if (!organizationId) {
    return (
      <>
        <PageHeader />
        <div className="mt-6">
          <EmptyState
            title="Select an organization to continue"
            description="Pick an organization from the workspace selector above to view or schedule maintenance."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader action={!machinesLoading ? <ScheduleButton hasMachines={hasMachines} onClick={() => setShowCreate(true)} /> : undefined} />

      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Scheduled" value={String(summary.scheduled)} hint="More than 24h away" />
          <Stat label="Due soon" value={String(summary.dueSoon)} hint="Starting within 24h" tone={summary.dueSoon > 0 ? "warning" : undefined} />
          <Stat label="Overdue" value={String(summary.overdue)} tone={summary.overdue > 0 ? "danger" : undefined} />
          <Stat label="In progress" value={String(summary.inProgress)} hint={`${summary.machinesUnderMaintenance} machine(s) under maintenance`} />
          <Stat label="Records this month" value={String(summary.totalRecords)} hint={`${summary.cancelled} cancelled`} />
          <Stat label="Completed this month" value={String(summary.completed)} hint={`Downtime ${formatDowntime(summary.totalDowntimeMinutesInPeriod)}`} />
          <Stat
            label="Cost this month"
            value={formatINR(summary.totalCostInPeriod)}
            hint={`${formatINR(summary.actualCostInPeriod)} actual + ${formatINR(summary.estimatedCostFallbackInPeriod)} estimated`}
          />
          <Stat label="Machines" value={String(summary.totalMachines)} />
        </div>
      )}

      <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${view === v ? "bg-orange-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {v === "list" ? "List" : "Calendar"}
          </button>
        ))}
      </div>

      {view === "calendar" ? (
        <div className="mt-4">
          <MaintenanceCalendar organizationId={orgId} />
        </div>
      ) : noRecordsAtAll && !recordsError ? (
        <div className="mt-6">
          <EmptyState
            title="No maintenance records"
            description="Add machines first, then schedule maintenance tasks."
            action={<ScheduleButton hasMachines={hasMachines} onClick={() => setShowCreate(true)} />}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-48">
              <label className="mb-1 block text-xs font-medium text-slate-600">Machine</label>
              <select className={inputClass} value={machineId} onChange={(e) => resetPage(setMachineId)(e.target.value)}>
                <option value="">All machines</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="mb-1 block text-xs font-medium text-slate-600">Project / site</label>
              <select className={inputClass} value={projectId} onChange={(e) => resetPage(setProjectId)(e.target.value)}>
                <option value="">All projects</option>
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
              <select className={inputClass} value={type} onChange={(e) => resetPage(setType)(e.target.value as MaintenanceType | "")}>
                <option value="">All</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
              <select className={inputClass} value={priority} onChange={(e) => resetPage(setPriority)(e.target.value as MaintenancePriority | "")}>
                <option value="">All</option>
                {MAINTENANCE_PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{MAINTENANCE_PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
              <select className={inputClass} value={status} onChange={(e) => resetPage(setStatus)(e.target.value as MaintenanceStatus | "")}>
                <option value="">All</option>
                {MAINTENANCE_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{MAINTENANCE_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Scheduled from</label>
              <input type="date" className={inputClass} value={dateFrom} onChange={(e) => resetPage(setDateFrom)(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Scheduled to</label>
              <input type="date" className={inputClass} value={dateTo} onChange={(e) => resetPage(setDateTo)(e.target.value)} />
            </div>
            <div className="w-56">
              <label className="mb-1 block text-xs font-medium text-slate-600">Search (this page)</label>
              <input className={inputClass} placeholder="Reference, title, machine..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {([
              ["", "All"],
              ["upcoming", "Upcoming (7 days)"],
              ["overdue", "Overdue"],
            ] as const).map(([value, label]) => (
              <button
                key={value || "all"}
                onClick={() => resetPage(setQuick)(value)}
                className={`rounded-full border px-3 py-1 font-medium ${quick === value ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
            {filtersActive && (
              <button
                className="ml-1 text-slate-500 hover:text-slate-800 hover:underline"
                onClick={() => {
                  setMachineId("");
                  setProjectId("");
                  setType("");
                  setPriority("");
                  setStatus("");
                  setDateFrom("");
                  setDateTo("");
                  setQuick("");
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-4">
            {recordsError ? (
              <ErrorState message={recordsError.message} />
            ) : (
              <DataTable columns={columns} rows={visibleRecords} loading={recordsLoading} emptyTitle="No maintenance records match your filters" />
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRecords} records
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <MaintenanceFormDialog
          organizationId={orgId}
          defaultProjectId={workspaceProjectId}
          onClose={() => setShowCreate(false)}
          onSaved={refreshAll}
        />
      )}

      {pendingAction && (
        <MaintenanceActionDialog
          record={pendingAction.record}
          action={pendingAction.action}
          onClose={() => setPendingAction(null)}
          onDone={refreshAll}
        />
      )}
    </>
  );
}
