"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/api-client";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import { FaceCheckin } from "@/components/common/face-checkin";
import { formatClock, formatWork, localToday, METHOD_LABELS, STATE_LABELS, STATE_STYLES } from "@/lib/attendance-format";
import type { DailyAttendance } from "@/types/attendance";
import type { ApiError } from "@/types/api";

export default function QrCheckinPage() {
  const { projectId } = useWorkspace();
  const [date, setDate] = useState(localToday());
  const [days, setDays] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    apiClient
      .get<DailyAttendance[]>(`/nextenti/tracking/attendance/daily?projectId=${projectId}&date=${date}`)
      .then(setDays)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId, date]);

  useEffect(load, [load]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Worker check-in &amp; check-out</h1>
          <p className="mt-1 text-sm text-slate-500">Workers check in and out by face or QR code. The time is recorded by the server.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/workers/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ Register new worker</Link>
          <Link href="/workers" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Worker QR codes</Link>
        </div>
      </div>

      {projectId && (
        <section className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Check in / Check out</h2>
          <p className="mt-1 text-xs text-slate-500">Registered workers only. The first scan checks the worker in; the next scan checks them out.</p>
          <div className="mt-4"><FaceCheckin projectId={projectId} onChanged={load} /></div>
        </section>
      )}

      {projectId && (
        <div className="mt-5 flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
      )}

      <div className="mt-4">
        {!projectId ? (
          <ErrorState message="Select a project from the top bar to view attendance." />
        ) : loading && days.length === 0 ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : days.length === 0 ? (
          <EmptyState title="No check-ins for this date" description="Attendance appears here once registered workers check in." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Employee ID", "Worker", "First check-in", "Last check-out", "Total work", "Status", "Sessions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((d) => (
                  <tr key={d.workerId} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{d.employeeId ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-900">{d.workerName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatClock(d.firstCheckInTime)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatClock(d.lastCheckOutTime)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatWork(d.totalWorkSeconds)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLES[d.status]}`}>{STATE_LABELS[d.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {d.sessions.map((s, i) => (
                        <div key={s.id} className="whitespace-nowrap">
                          {i + 1}. {formatClock(s.checkInTime)} → {s.checkOutTime ? formatClock(s.checkOutTime) : "in progress"}
                          <span className="ml-1 text-slate-400">({METHOD_LABELS[s.checkInMethod ?? ""] ?? "—"}{s.checkOutMethod ? ` / ${METHOD_LABELS[s.checkOutMethod] ?? s.checkOutMethod}` : ""})</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">{days.length} worker{days.length !== 1 ? "s" : ""}</div>
          </div>
        )}
      </div>
    </>
  );
}
