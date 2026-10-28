"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { machineUtilizationApi } from "@/lib/api/machine-utilization-api";
import { machineApi } from "@/lib/api/machine-api";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import type { MachineStatus } from "@/types/machine";
import type { MachineUtilizationListItem, ReportingPeriod } from "@/types/machine-utilization";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  RETIRED: "bg-red-100 text-red-700",
};

function toIso(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function defaultRange(period: ReportingPeriod): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (period === "DAILY") {
    // same day
  } else if (period === "WEEKLY") {
    start.setDate(start.getDate() - 6);
  } else {
    start.setDate(1);
  }
  return { start: toIso(start), end: toIso(end) };
}

// Renders a value that may be `null` ("not recorded" — never a fabricated 0 or dash).
function MetricValue({ value, suffix = "" }: { value: number | null | undefined; suffix?: string }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic" title="Not recorded by the backend for this period">Not recorded</span>;
  }
  return <span>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{suffix}</span>;
}

function KpiCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// Small dependency-free horizontal bar chart (no charting library exists in this
// project yet — see package.json). Falls back to ChartPlaceholder's "awaiting
// data" treatment when there is nothing to plot; never invents values.
function SimpleBarChart({
  title,
  description,
  data,
  unit = "",
}: {
  title: string;
  description: string;
  data: { label: string; value: number | null }[];
  unit?: string;
}) {
  const usable = data.filter((d) => d.value !== null) as { label: string; value: number }[];
  if (usable.length === 0) {
    return <ChartPlaceholder title={title} description={description} />;
  }
  const max = Math.max(...usable.map((d) => d.value), 0.0001);
  return (
    <section className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <div className="mt-4 space-y-2.5">
        {usable.slice(0, 8).map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate pr-2">{d.label}</span>
              <span className="shrink-0 font-medium text-slate-800">{d.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{unit}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-orange-500 motion-reduce:transition-none"
                style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MachineUtilizationPage() {
  const router = useRouter();
  const { organizationId, projectId } = useWorkspace();

  const [period, setPeriod] = useState<ReportingPeriod>("MONTHLY");
  const [{ start, end }, setRange] = useState(() => defaultRange("MONTHLY"));
  const [projectFilter, setProjectFilter] = useState<string>(projectId ?? "");
  const [machineFilter, setMachineFilter] = useState<string>("");
  const [machineTypeFilter, setMachineTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "">("");
  const [search, setSearch] = useState("");

  function handlePeriodChange(next: ReportingPeriod) {
    setPeriod(next);
    if (next !== "CUSTOM") setRange(defaultRange(next));
  }

  const { data: machinePage } = useApi(
    () => machineApi.list({ organizationId: organizationId as string, limit: 200 }),
    { skip: !organizationId, deps: [organizationId] }
  );
  const machines = machinePage?.items ?? [];
  const machineTypes = useMemo(
    () => Array.from(new Set(machines.map((m) => m.type).filter((t): t is string => !!t))),
    [machines]
  );

  const effectiveProjectId = projectFilter || undefined;

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useApi(
    () => machineUtilizationApi.getSummary({ startDate: start, endDate: end, projectId: effectiveProjectId }),
    { skip: !start || !end, deps: [start, end, effectiveProjectId] }
  );

  const {
    data: listPage,
    loading: listLoading,
    error: listError,
    refetch: refetchList,
  } = useApi(
    () =>
      machineUtilizationApi.list({
        startDate: start,
        endDate: end,
        projectId: effectiveProjectId,
        machineId: machineFilter || undefined,
        machineType: machineTypeFilter || undefined,
        status: statusFilter || undefined,
        page: 0,
        size: 100,
      }),
    {
      skip: !start || !end,
      deps: [start, end, effectiveProjectId, machineFilter, machineTypeFilter, statusFilter],
    }
  );

  const { data: projectUsage } = useApi(
    () => machineUtilizationApi.getProjectUsage({ startDate: start, endDate: end }),
    { skip: !start || !end, deps: [start, end] }
  );

  const rows = listPage?.items ?? [];
  const filteredRows = search
    ? rows.filter(
        (r) =>
          r.machineName.toLowerCase().includes(search.toLowerCase()) ||
          r.machineId.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  const hasAnyData = rows.length > 0;

  const columns: TableColumn<MachineUtilizationListItem>[] = [
    {
      key: "machineId",
      label: "Machine ID",
      render: (r) => <span className="font-mono text-xs text-slate-500">#{r.machineId.slice(0, 8)}</span>,
    },
    { key: "machineName", label: "Machine Name", render: (r) => <span className="font-medium text-slate-900">{r.machineName}</span> },
    { key: "project", label: "Project / Site", render: (r) => r.projectName ?? "—" },
    { key: "running", label: "Running Hours", render: (r) => <MetricValue value={r.runningHours} suffix=" h" /> },
    { key: "idle", label: "Idle Hours", render: (r) => <MetricValue value={r.idleHours} suffix=" h" /> },
    { key: "available", label: "Available Hours", render: (r) => <MetricValue value={r.availableHours} suffix=" h" /> },
    { key: "utilization", label: "Utilization %", render: (r) => <MetricValue value={r.utilizationPercentage} suffix="%" /> },
    { key: "fuel", label: "Fuel Consumed", render: (r) => <MetricValue value={r.fuelConsumed} suffix=" L" /> },
    { key: "fuelCost", label: "Fuel Cost", render: (r) => <MetricValue value={r.fuelCost} suffix=" ₹" /> },
    { key: "maintCost", label: "Maintenance Cost", render: (r) => <MetricValue value={r.maintenanceCost} suffix=" ₹" /> },
    { key: "costPerHour", label: "Operating Cost / Hr", render: (r) => <MetricValue value={r.operatingCostPerHour} suffix=" ₹" /> },
    {
      key: "status",
      label: "Status",
      render: (r) =>
        r.status ? (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"}`}>
            {r.status}
          </span>
        ) : (
          <span className="text-slate-400 italic">Not recorded</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="text-orange-600 hover:underline" onClick={() => router.push(`/machine-utilization/${r.machineId}`)}>
            View Details
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="animate-fade-in-up">
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Machine Utilization</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare running hours, idle time, fuel, maintenance cost, and cost per hour.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Reporting period</label>
          <select className={inputClass} value={period} onChange={(e) => handlePeriodChange(e.target.value as ReportingPeriod)}>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Start date</label>
          <input
            type="date"
            className={inputClass}
            value={start}
            onChange={(e) => {
              setPeriod("CUSTOM");
              setRange((r) => ({ ...r, start: e.target.value }));
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">End date</label>
          <input
            type="date"
            className={inputClass}
            value={end}
            onChange={(e) => {
              setPeriod("CUSTOM");
              setRange((r) => ({ ...r, end: e.target.value }));
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Machine</label>
          <select className={inputClass} value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
            <option value="">All machines</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Machine type</label>
          <select className={inputClass} value={machineTypeFilter} onChange={(e) => setMachineTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {machineTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MachineStatus | "")}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
        <div className="w-56">
          <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
          <input className={inputClass} placeholder="Search machine..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setMachineFilter("");
              setMachineTypeFilter("");
              setStatusFilter("");
              setSearch("");
            }}
          >
            Clear
          </button>
          <button
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            onClick={() => refetchList()}
          >
            Refresh
          </button>
        </div>
      </div>

      {summaryError || listError ? (
        <div className="mt-6">
          <ErrorState message={(summaryError ?? listError)?.message} />
        </div>
      ) : summaryLoading && listLoading ? (
        <div className="mt-6"><Loading /></div>
      ) : !hasAnyData ? (
        <div className="mt-6">
          <EmptyState
            title="No utilization data"
            description="Machine utilization, project-wise usage, running and idle hour analytics will appear when machine usage records are available."
            action={
              <button
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                onClick={() => router.push("/machines")}
              >
                Go to Machine Management
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Running Hours" value={<MetricValue value={summary?.totalRunningHours} suffix=" h" />} />
            <KpiCard label="Idle Hours" value={<MetricValue value={summary?.totalIdleHours} suffix=" h" />} />
            <KpiCard label="Utilization %" value={<MetricValue value={summary?.utilizationPercentage} suffix="%" />} />
            <KpiCard label="Fuel Consumed" value={<MetricValue value={summary?.totalFuelConsumed} suffix=" L" />} />
            <KpiCard label="Maintenance Cost" value={<MetricValue value={summary?.totalMaintenanceCost} suffix=" ₹" />} />
            <KpiCard label="Cost per Hour" value={<MetricValue value={summary?.averageCostPerHour} suffix=" ₹" />} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SimpleBarChart
              title="Running vs idle hours"
              description="Per-machine running hours for the selected period."
              data={rows.map((r) => ({ label: r.machineName, value: r.runningHours }))}
              unit=" h"
            />
            <SimpleBarChart
              title="Utilization by machine"
              description="Utilization percentage per machine."
              data={rows.map((r) => ({ label: r.machineName, value: r.utilizationPercentage }))}
              unit="%"
            />
            <SimpleBarChart
              title="Project-wise machine usage"
              description="Total running hours aggregated by project/site."
              data={(projectUsage ?? []).map((p) => ({ label: p.projectName, value: p.totalRunningHours }))}
              unit=" h"
            />
            <SimpleBarChart
              title="Fuel consumption"
              description="Fuel consumed per machine for the selected period."
              data={rows.map((r) => ({ label: r.machineName, value: r.fuelConsumed }))}
              unit=" L"
            />
            <SimpleBarChart
              title="Maintenance cost"
              description="Maintenance cost per machine for the selected period."
              data={rows.map((r) => ({ label: r.machineName, value: r.maintenanceCost }))}
              unit=" ₹"
            />
          </div>

          <div className="mt-6">
            <DataTable columns={columns} rows={filteredRows} loading={listLoading} emptyTitle="No machines match your filters" />
          </div>
        </>
      )}
    </>
  );
}
