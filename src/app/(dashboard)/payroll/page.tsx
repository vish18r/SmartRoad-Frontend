"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { payrollApi } from "@/lib/api/payroll-api";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { formatINR, formatNumber } from "@/lib/currency";
import {
  PAYROLL_STATUS_LABELS,
  PAYROLL_STATUS_STYLES,
  WAGE_TYPE_LABELS,
  formatDate,
} from "@/lib/payroll-format";
import type { WorkerResponse } from "@/types/worker";
import type { PayrollListFilters, PayrollResponse, PayrollStatus, PayrollSummary, WageType } from "@/types/payroll";
import type { PaginationMeta } from "@/types/common";
import type { ApiError } from "@/types/api";

const PAGE_SIZE = 20;

const EMPTY_PAGINATION: PaginationMeta = {
  currentPage: 1,
  pageSize: PAGE_SIZE,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function PayrollPage() {
  const { organizationId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [rows, setRows] = useState<PayrollResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [workerId, setWorkerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<PayrollStatus | "">("");
  const [wageType, setWageType] = useState<WageType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const filters: PayrollListFilters = {
    organizationId: organizationId ?? undefined,
    workerId: workerId || undefined,
    employeeId: employeeId || undefined,
    status: status || undefined,
    wageType: wageType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
  };

  useEffect(() => {
    if (!organizationId) return;
    workersApi.list(organizationId).then(setWorkers).catch(() => {});
  }, [organizationId]);

  const load = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    Promise.all([payrollApi.list(filters, page, PAGE_SIZE), payrollApi.summary(filters)])
      .then(([listResponse, summaryResponse]) => {
        setRows(listResponse.data);
        setPagination(listResponse.pagination);
        setSummary(summaryResponse);
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
    // filters is rebuilt every render from primitive state below; listing its primitives keeps
    // this effect's dependency array both correct and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, workerId, employeeId, status, wageType, startDate, endDate, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  function clearFilters() {
    setWorkerId("");
    setEmployeeId("");
    setStatus("");
    setWageType("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  }

  async function runAction(id: string, action: (id: string) => Promise<PayrollResponse>) {
    setBusyId(id);
    setActionError("");
    try {
      await action(id);
      load();
    } catch (e) {
      setActionError((e as ApiError).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="mt-1 text-sm text-slate-500">Calculate and process worker wages, deductions, allowances, and net pay.</p>
        </div>
        <Link href="/payroll/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
          + New payroll
        </Link>
      </div>

      {!organizationId ? (
        <div className="mt-6">
          <ErrorState message="Select an organization from the top bar." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card title="Total workers" value={String(summary?.totalWorkers ?? 0)} />
            <Card title="Total gross payroll" value={formatINR(summary?.totalGrossPayroll)} />
            <Card title="Total deductions" value={formatINR(summary?.totalDeductions)} />
            <Card title="Total net pay" value={formatINR(summary?.totalNetPay)} />
            <Card title="Pending payroll" value={String(summary?.pendingPayrollCount ?? 0)} />
            <Card title="Paid payroll" value={String(summary?.paidPayrollCount ?? 0)} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                aria-label="Filter by worker"
                value={workerId}
                onChange={(e) => { setWorkerId(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">All workers</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>{w.fullName} ({w.employeeId})</option>
                ))}
              </select>
              <input
                aria-label="Filter by employee ID"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => { setEmployeeId(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => { setStatus(e.target.value as PayrollStatus | ""); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {Object.entries(PAYROLL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                aria-label="Filter by wage type"
                value={wageType}
                onChange={(e) => { setWageType(e.target.value as WageType | ""); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All wage types</option>
                {Object.entries(WAGE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Period start
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Period end
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
              </label>
              <input
                aria-label="Search"
                placeholder="Search employee ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Clear filters
              </button>
            </div>
          </div>

          {actionError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

          <div className="mt-4">
            {loading ? <Loading /> : error ? <ErrorState message={error} /> :
             rows.length === 0 ? (
              <EmptyState title="No payroll records" description="Create a payroll from a worker's attendance to get started." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[1400px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      {["Employee ID", "Worker", "Period", "Wage type", "Paid days", "Worked hrs", "OT hrs", "Basic wage", "Allowances", "Gross pay", "Deductions", "Net pay", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{p.employeeId}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{p.workerName ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(p.payrollStartDate)} – {formatDate(p.payrollEndDate)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{WAGE_TYPE_LABELS[p.wageType] ?? p.wageType}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNumber(p.attendance.paidDays)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNumber(p.attendance.totalWorkedHours)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatNumber(p.attendance.overtimeHours)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatINR(p.basicWage)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatINR(p.totalAllowances)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{formatINR(p.grossPay)}</td>
                        <td className="px-4 py-3 text-red-600 whitespace-nowrap">{formatINR(p.totalDeductions)}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700 whitespace-nowrap">{formatINR(p.netPay)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PAYROLL_STATUS_STYLES[p.status ?? ""] ?? "bg-slate-100 text-slate-600"}`}>
                            {PAYROLL_STATUS_LABELS[p.status ?? ""] ?? p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PayrollRowActions payroll={p} busy={busyId === p.id} onAction={(fn) => runAction(p.id as string, fn)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                  <span>{pagination.totalRecords} payroll record{pagination.totalRecords !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-40">
                      Previous
                    </button>
                    <span>Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}</span>
                    <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-40">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function PayrollRowActions({ payroll, busy, onAction }: { payroll: PayrollResponse; busy: boolean; onAction: (fn: (id: string) => Promise<PayrollResponse>) => void }) {
  const linkClasses = "text-xs font-medium text-orange-600 hover:underline";
  const buttonClasses = "text-xs font-medium text-orange-600 hover:underline disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/payroll/${payroll.id}`} className={linkClasses}>View</Link>
      {payroll.status === "draft" && <Link href={`/payroll/${payroll.id}`} className={linkClasses}>Edit</Link>}
      {payroll.status === "draft" && (
        <button type="button" disabled={busy} className={buttonClasses} onClick={() => onAction(payrollApi.process)}>Process</button>
      )}
      {payroll.status === "processed" && (
        <button type="button" disabled={busy} className={buttonClasses} onClick={() => onAction(payrollApi.approve)}>Approve</button>
      )}
      {payroll.status === "approved" && (
        <button type="button" disabled={busy} className={buttonClasses} onClick={() => onAction(payrollApi.markPaid)}>Mark paid</button>
      )}
      {payroll.status !== "paid" && payroll.status !== "cancelled" && (
        <button type="button" disabled={busy} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40" onClick={() => onAction(payrollApi.cancel)}>Cancel</button>
      )}
    </div>
  );
}
