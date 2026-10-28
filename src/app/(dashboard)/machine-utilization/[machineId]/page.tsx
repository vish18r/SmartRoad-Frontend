"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { machineUtilizationApi } from "@/lib/api/machine-utilization-api";
import { machineApi } from "@/lib/api/machine-api";
import { useApi } from "@/hooks/useApi";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import type { ReportingPeriod } from "@/types/machine-utilization";

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
  if (period === "WEEKLY") start.setDate(start.getDate() - 6);
  else if (period === "MONTHLY") start.setDate(1);
  return { start: toIso(start), end: toIso(end) };
}

function MetricValue({ value, suffix = "" }: { value: number | null | undefined; suffix?: string }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-400 italic" title="Not recorded by the backend for this period">Not recorded</span>;
  }
  return <span>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{suffix}</span>;
}

function KpiCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function MachineUtilizationDetailPage() {
  const params = useParams<{ machineId: string }>();
  const router = useRouter();
  const machineId = params.machineId;

  const [period, setPeriod] = useState<ReportingPeriod>("MONTHLY");
  const [{ start, end }, setRange] = useState(() => defaultRange("MONTHLY"));

  function handlePeriodChange(next: ReportingPeriod) {
    setPeriod(next);
    if (next !== "CUSTOM") setRange(defaultRange(next));
  }

  const { data: machine } = useApi(
    () => machineApi.getById(machineId),
    { skip: !machineId, deps: [machineId] }
  );

  const {
    data: detail,
    loading: detailLoading,
    error: detailError,
  } = useApi(
    () => machineUtilizationApi.getById(machineId, { startDate: start, endDate: end }),
    { skip: !machineId || !start || !end, deps: [machineId, start, end] }
  );

  const {
    data: history,
    loading: historyLoading,
  } = useApi(
    () => machineUtilizationApi.getUsageHistory(machineId, { startDate: start, endDate: end, size: 50 }),
    { skip: !machineId || !start || !end, deps: [machineId, start, end] }
  );

  const displayName = machine?.name ?? detail?.machineName ?? "Machine";
  const displayType = machine?.type ?? detail?.machineType ?? null;
  const displayStatus = machine?.status ?? detail?.status ?? null;
  const registrationNumber = machine?.registrationNumber ?? detail?.registrationNumber ?? null;

  return (
    <>
      <div className="animate-fade-in-up flex flex-wrap items-start justify-between gap-3">
        <div>
          <button className="text-xs font-medium text-orange-600 hover:underline" onClick={() => router.push("/machine-utilization")}>
            ← Back to Machine Utilization
          </button>
          <p className="mt-2 text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{displayName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{machineId}</span>
            {displayType && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{displayType}</span>}
            {registrationNumber && <span className="text-xs text-slate-400">{registrationNumber}</span>}
            {displayStatus && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[displayStatus] ?? "bg-slate-100 text-slate-600"}`}>
                {displayStatus}
              </span>
            )}
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => router.push(`/machines/${machineId}`)}
        >
          View Machine Record
        </button>
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
      </div>

      {detailError ? (
        <div className="mt-6"><ErrorState message={detailError.message} /></div>
      ) : detailLoading ? (
        <div className="mt-6"><Loading /></div>
      ) : !detail ? (
        <div className="mt-6">
          <EmptyState
            title="No utilization data"
            description="Usage records for this machine will appear here once they are recorded for the selected period."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Running Hours" value={<MetricValue value={detail.runningHours} suffix=" h" />} />
            <KpiCard label="Idle Hours" value={<MetricValue value={detail.idleHours} suffix=" h" />} />
            <KpiCard label="Available Hours" value={<MetricValue value={detail.availableHours} suffix=" h" />} />
            <KpiCard label="Utilization %" value={<MetricValue value={detail.utilizationPercentage} suffix="%" />} />
            <KpiCard label="Fuel Consumed" value={<MetricValue value={detail.fuelConsumed} suffix=" L" />} />
            <KpiCard label="Fuel Cost" value={<MetricValue value={detail.fuelCost} suffix=" ₹" />} />
            <KpiCard label="Maintenance Cost" value={<MetricValue value={detail.maintenanceCost} suffix=" ₹" />} />
            <KpiCard label="Cost per Hour" value={<MetricValue value={detail.operatingCostPerHour} suffix=" ₹" />} />
          </div>

          <section className="mt-6 animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
            <h2 className="font-semibold text-slate-900">Project-wise usage</h2>
            {!detail.projectUsage || detail.projectUsage.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No project-wise usage recorded for this period.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Project</th>
                      <th className="px-3 py-2 font-semibold">Running Hours</th>
                      <th className="px-3 py-2 font-semibold">Idle Hours</th>
                      <th className="px-3 py-2 font-semibold">Utilization %</th>
                      <th className="px-3 py-2 font-semibold">Fuel Consumed</th>
                      <th className="px-3 py-2 font-semibold">Maintenance Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.projectUsage.map((p) => (
                      <tr key={p.projectId}>
                        <td className="px-3 py-2 font-medium text-slate-900">{p.projectName}</td>
                        <td className="px-3 py-2"><MetricValue value={p.totalRunningHours} suffix=" h" /></td>
                        <td className="px-3 py-2"><MetricValue value={p.totalIdleHours} suffix=" h" /></td>
                        <td className="px-3 py-2"><MetricValue value={p.utilizationPercentage} suffix="%" /></td>
                        <td className="px-3 py-2"><MetricValue value={p.totalFuelConsumed} suffix=" L" /></td>
                        <td className="px-3 py-2"><MetricValue value={p.totalMaintenanceCost} suffix=" ₹" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
            <h2 className="font-semibold text-slate-900">Usage history</h2>
            {historyLoading ? (
              <Loading />
            ) : !history || history.items.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No usage sessions recorded for this period.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {history.items.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{h.date}{h.projectName ? ` · ${h.projectName}` : ""}</p>
                      <p className="text-xs text-slate-500">
                        {h.startTime ?? "—"}{h.endTime ? ` – ${h.endTime}` : ""}
                        {h.operatorName ? ` · Operator: ${h.operatorName}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-600">
                      <span>Running: <MetricValue value={h.runningHours} suffix=" h" /></span>
                      <span>Idle: <MetricValue value={h.idleHours} suffix=" h" /></span>
                      <span>Fuel: <MetricValue value={h.fuelConsumed} suffix=" L" /></span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Maintenance history</h2>
              <button className="text-xs font-medium text-orange-600 hover:underline" onClick={() => router.push("/maintenance")}>
                Open Maintenance Module
              </button>
            </div>
            {!detail.maintenanceHistory || detail.maintenanceHistory.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No maintenance records for this machine in the selected period.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {detail.maintenanceHistory.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{m.date}{m.type ? ` · ${m.type}` : ""}</p>
                      {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                    </div>
                    <span className="text-xs text-slate-600">Cost: <MetricValue value={m.cost} suffix=" ₹" /></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
