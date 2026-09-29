"use client";

import { useEffect, useState } from "react";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { WorkerResponse, AttendanceResponse } from "@/types/worker";
import type { ApiError } from "@/types/api";
import { apiClient } from "@/lib/api/api-client";

function today() { return new Date().toISOString().split("T")[0]; }

const STATUS_COLORS: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  half_day: "bg-yellow-100 text-yellow-700",
  leave: "bg-blue-100 text-blue-700",
};

export default function AttendancePage() {
  const { organizationId, projectId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [attendance, setAttendance] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(today());

  useEffect(() => {
    if (!organizationId) return;
    workersApi.list(organizationId).then(setWorkers).catch(() => {});
  }, [organizationId]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError("");
    apiClient.get<AttendanceResponse[]>(`/workers/attendance?projectId=${projectId}&date=${date}`)
      .then(setAttendance)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId, date]);

  const attendanceMap = Object.fromEntries(attendance.map(a => [a.workerId, a]));

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Track daily workforce attendance by project.</p>
      </div>

      {!organizationId ? (
        <div className="mt-6"><ErrorState message="Select an organization from the top bar." /></div>
      ) : !projectId ? (
        <div className="mt-6"><ErrorState message="Select a project from the top bar to view attendance." /></div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="mt-4">
            {loading ? <Loading /> : error ? <ErrorState message={error} /> :
             workers.length === 0 ? (
              <EmptyState title="No workers" description="Add workers to the organization to track attendance." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {["Worker", "Role", "Status", "Hours Worked", "Notes"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workers.map(w => {
                      const rec = attendanceMap[w.id];
                      return (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{w.firstName} {w.lastName ?? ""}</td>
                          <td className="px-4 py-3 text-slate-600">{w.role ?? "—"}</td>
                          <td className="px-4 py-3">
                            {rec ? (
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rec.status] ?? "bg-slate-100 text-slate-600"}`}>
                                {rec.status.replace(/_/g, " ")}
                              </span>
                            ) : <span className="text-slate-400 text-xs">Not marked</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{rec?.hoursWorked ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{rec?.notes ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  {attendance.filter(a => a.status === "present").length} present · {attendance.filter(a => a.status === "absent").length} absent · {workers.length - attendance.length} not marked
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
