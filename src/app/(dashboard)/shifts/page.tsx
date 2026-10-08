"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { shiftApi } from "@/lib/api/shift-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import {
  SHIFT_STATUS_LABELS,
  SHIFT_STATUS_STYLES,
  formatTime,
  formatWorkingMinutes,
} from "@/lib/shift-format";
import type { ShiftListFilters, ShiftResponse, ShiftStatus, ShiftSummary } from "@/types/shift";
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

export default function ShiftsPage() {
  const { organizationId } = useWorkspace();
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [rows, setRows] = useState<ShiftResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [status, setStatus] = useState<ShiftStatus | "">("");
  const [search, setSearch] = useState("");

  const filters: ShiftListFilters = {
    organizationId: organizationId ?? undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const load = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    Promise.all([shiftApi.list(filters, page, PAGE_SIZE), shiftApi.summary(organizationId)])
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
  }, [organizationId, status, search, page]);

  useEffect(() => { load(); }, [load]);

  function clearFilters() {
    setStatus("");
    setSearch("");
    setPage(1);
  }

  async function toggleStatus(shift: ShiftResponse) {
    setBusyId(shift.id);
    setActionError("");
    try {
      await shiftApi.updateStatus(shift.id, shift.status === "active" ? "inactive" : "active");
      load();
    } catch (e) {
      setActionError((e as ApiError).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(shift: ShiftResponse) {
    if (!window.confirm(`Delete "${shift.shiftName}"? This is only possible when it has no assignment history.`)) return;
    setBusyId(shift.id);
    setActionError("");
    try {
      await shiftApi.delete(shift.id);
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
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Shifts</h1>
          <p className="mt-1 text-sm text-slate-500">Define and manage work shifts, timings, and worker assignments.</p>
        </div>
        <Link href="/shifts/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
          + Create Shift
        </Link>
      </div>

      {!organizationId ? (
        <div className="mt-6">
          <ErrorState message="Select an organization from the top bar." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card title="Total shift templates" value={String(summary?.totalShiftTemplates ?? 0)} />
            <Card title="Active shifts" value={String(summary?.activeShifts ?? 0)} />
            <Card title="Inactive shifts" value={String(summary?.inactiveShifts ?? 0)} />
            <Card title="Workers assigned" value={String(summary?.workersAssigned ?? 0)} />
            <Card title="Unassigned workers" value={String(summary?.unassignedWorkers ?? 0)} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                aria-label="Search by shift name or code"
                placeholder="Search by shift name or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => { setStatus(e.target.value as ShiftStatus | ""); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {Object.entries(SHIFT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Clear filters
              </button>
            </div>
          </div>

          {actionError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

          <div className="mt-4">
            {loading ? <Loading /> : error ? <ErrorState message={error} /> :
             rows.length === 0 ? (
              <EmptyState
                title="No shifts configured"
                description="Create shift templates to start scheduling workers."
                action={<Link href="/shifts/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">Create Shift</Link>}
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      {["Shift code", "Shift name", "Start", "End", "Break", "Working hours", "Assigned", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{s.shiftCode}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{s.shiftName}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTime(s.startTime)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTime(s.endTime)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.breakDurationMinutes} min</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatWorkingMinutes(s.totalWorkingMinutes)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.assignedWorkersCount ?? 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SHIFT_STATUS_STYLES[s.status]}`}>
                            {SHIFT_STATUS_LABELS[s.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/shifts/${s.id}`} className="text-xs font-medium text-orange-600 hover:underline">View</Link>
                            <Link href={`/shifts/${s.id}/edit`} className="text-xs font-medium text-orange-600 hover:underline">Edit</Link>
                            <button type="button" disabled={busyId === s.id} onClick={() => toggleStatus(s)} className="text-xs font-medium text-orange-600 hover:underline disabled:opacity-40">
                              {s.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" disabled={busyId === s.id} onClick={() => handleDelete(s)} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                  <span>{pagination.totalRecords} shift{pagination.totalRecords !== 1 ? "s" : ""}</span>
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
