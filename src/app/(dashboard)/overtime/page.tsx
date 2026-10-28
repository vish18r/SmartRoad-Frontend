"use client";

import { useCallback, useEffect, useState } from "react";
import { payrollApi } from "@/lib/api/payroll-api";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { formatINR, formatNumber } from "@/lib/currency";
import { formatDate } from "@/lib/payroll-format";
import type { WorkerResponse } from "@/types/worker";
import type { PayrollListFilters, PayrollResponse } from "@/types/payroll";
import type { ApiError } from "@/types/api";

const PAGE_SIZE = 50;

export default function OvertimePage() {
  const { organizationId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [rows, setRows] = useState<PayrollResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    workersApi.list(organizationId).then(setWorkers).catch(() => {});
  }, [organizationId]);

  const load = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    const filters: PayrollListFilters = {
      organizationId,
      workerId: workerId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    // Overtime has no dedicated endpoint — it is a figure the backend already computes per
    // payroll period, so this page reuses the payroll list and keeps only the paid periods
    // that actually logged overtime hours.
    payrollApi
      .list(filters, 1, PAGE_SIZE)
      .then((response) => setRows(response.data.filter((p) => p.attendance.overtimeHours > 0)))
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizationId, workerId, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  function clearFilters() {
    setWorkerId("");
    setStartDate("");
    setEndDate("");
  }

  const totalOvertimeHours = rows.reduce((sum, p) => sum + p.attendance.overtimeHours, 0);
  const totalOvertimeAmount = rows.reduce((sum, p) => sum + p.overtimeAmount, 0);

  return (
    <>
      <div className="animate-fade-in-up">
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Overtime</h1>
        <p className="mt-1 text-sm text-slate-500">Track overtime hours logged by workers across projects and sites.</p>
      </div>

      {!organizationId ? (
        <div className="mt-6">
          <ErrorState message="Select an organization from the top bar." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card title="Workers with overtime" value={String(new Set(rows.map((p) => p.workerId)).size)} />
            <Card title="Total overtime hours" value={formatNumber(totalOvertimeHours)} />
            <Card title="Total overtime pay" value={formatINR(totalOvertimeAmount)} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                aria-label="Filter by worker"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All workers</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>{w.fullName} ({w.employeeId})</option>
                ))}
              </select>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Period start
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Period end
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
              </label>
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Clear filters
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <Loading />
            ) : error ? (
              <ErrorState message={error} />
            ) : rows.length === 0 ? (
              <EmptyState title="No overtime records" description="Overtime entries will appear once workers log extra hours." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      {["Employee ID", "Worker", "Site", "Period", "OT hrs", "OT rate", "OT pay"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => (
                      <tr key={p.id} className="transition-colors duration-[var(--transition-fast)] hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{p.employeeId}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{p.workerName ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.siteName ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(p.payrollStartDate)} – {formatDate(p.payrollEndDate)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNumber(p.attendance.overtimeHours)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatINR(p.overtimeRate)}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">{formatINR(p.overtimeAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
