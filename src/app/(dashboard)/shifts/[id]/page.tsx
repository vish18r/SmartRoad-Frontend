"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { shiftApi } from "@/lib/api/shift-api";
import { workersApi } from "@/lib/api/workers-api";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import {
  SHIFT_STATUS_LABELS,
  SHIFT_STATUS_STYLES,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_STYLES,
  formatTime,
  formatWorkingMinutes,
} from "@/lib/shift-format";
import { formatDate, localToday } from "@/lib/payroll-format";
import type { ShiftAssignmentResponse, ShiftResponse } from "@/types/shift";
import type { WorkerResponse } from "@/types/worker";
import type { ApiError } from "@/types/api";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function ShiftDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [assignments, setAssignments] = useState<ShiftAssignmentResponse[]>([]);
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignWorkerId, setAssignWorkerId] = useState("");
  const [assignFrom, setAssignFrom] = useState(localToday());
  const [assignTo, setAssignTo] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([shiftApi.getById(id), shiftApi.listAssignments({ shiftId: id }, 1, 200)])
      .then(([shiftResponse, assignmentResponse]) => {
        setShift(shiftResponse);
        setAssignments(assignmentResponse.data);
        return workersApi.list(shiftResponse.organizationId).catch(() => []);
      })
      .then((workerList) => setWorkers(workerList))
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus() {
    if (!shift) return;
    setActionBusy(true);
    setActionError("");
    try {
      const updated = await shiftApi.updateStatus(shift.id, shift.status === "active" ? "inactive" : "active");
      setShift(updated);
    } catch (e) {
      setActionError((e as ApiError).message);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete() {
    if (!shift || !window.confirm("Delete this shift template? This is only possible when it has no assignment history.")) return;
    setActionBusy(true);
    setActionError("");
    try {
      await shiftApi.delete(shift.id);
      router.push("/shifts");
    } catch (e) {
      setActionError((e as ApiError).message);
      setActionBusy(false);
    }
  }

  async function handleEndAssignment(assignmentId: string) {
    if (!window.confirm("End this worker's assignment to this shift as of today?")) return;
    setActionError("");
    try {
      const updated = await shiftApi.endAssignment(assignmentId);
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e) {
      setActionError((e as ApiError).message);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!shift || !assignWorkerId) { setAssignError("Select a worker."); return; }
    setAssigning(true);
    setAssignError("");
    try {
      const created = await shiftApi.createAssignment({
        workerId: assignWorkerId,
        shiftId: shift.id,
        effectiveFrom: assignFrom,
        effectiveTo: assignTo || undefined,
        status: "active",
      });
      setAssignments((prev) => [created, ...prev]);
      setShowAssignForm(false);
      setAssignWorkerId("");
      setAssignTo("");
    } catch (e2) {
      setAssignError((e2 as ApiError).message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !shift) return <ErrorState message={error || "Shift not found."} />;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/shifts" className="text-xs font-medium text-orange-600 hover:underline">← Back to shifts</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{shift.shiftName}</h1>
          <p className="mt-1 text-sm text-slate-500">{shift.shiftCode}</p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${SHIFT_STATUS_STYLES[shift.status]}`}>
          {SHIFT_STATUS_LABELS[shift.status]}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Shift details</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            <Info label="Start time" value={formatTime(shift.startTime)} />
            <Info label="End time" value={formatTime(shift.endTime)} />
            <Info label="Break" value={`${shift.breakDurationMinutes} min`} />
            <Info label="Working hours" value={formatWorkingMinutes(shift.totalWorkingMinutes)} />
            <Info label="Assigned workers" value={String(shift.assignedWorkersCount ?? assignments.filter((a) => a.status === "active").length)} />
            <Info label="Description" value={shift.description || "—"} />
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
          {actionError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href={`/shifts/${shift.id}/edit`} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              Edit
            </Link>
            <button type="button" disabled={actionBusy} onClick={() => setShowAssignForm((v) => !v)} className="rounded-lg border border-orange-600 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-50">
              Assign worker
            </button>
            <button type="button" disabled={actionBusy} onClick={toggleStatus} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              {shift.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button type="button" disabled={actionBusy} onClick={handleDelete} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              Delete
            </button>
          </div>

          {showAssignForm && (
            <form onSubmit={handleAssign} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              {assignError && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{assignError}</p>}
              <label className="block text-sm font-medium text-slate-700">
                Worker
                <select required value={assignWorkerId} onChange={(e) => setAssignWorkerId(e.target.value)} className={`${INPUT} mt-1`}>
                  <option value="">Select a worker...</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.employeeId} - {w.fullName}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Effective from
                  <input required type="date" value={assignFrom} onChange={(e) => setAssignFrom(e.target.value)} className={`${INPUT} mt-1`} />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Effective to
                  <input type="date" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className={`${INPUT} mt-1`} placeholder="Open-ended" />
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={assigning} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  {assigning ? "Assigning..." : "Assign"}
                </button>
                <button type="button" onClick={() => setShowAssignForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-800">Assigned workers</h2>
        <div className="mt-3">
          {assignments.length === 0 ? (
            <EmptyState title="No workers assigned" description="Assign a worker above to start scheduling them on this shift." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Employee ID", "Worker name", "Effective from", "Effective to", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{a.employeeId ?? "—"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{a.workerName ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(a.effectiveFrom)}</td>
                      <td className="px-4 py-3 text-slate-600">{a.effectiveTo ? formatDate(a.effectiveTo) : "Current"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ASSIGNMENT_STATUS_STYLES[a.status]}`}>
                          {ASSIGNMENT_STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.status !== "ended" && (
                          <button type="button" onClick={() => handleEndAssignment(a.id)} className="text-xs font-medium text-red-600 hover:underline">
                            End assignment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </>
  );
}
