"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/api-client";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ApiError } from "@/types/api";

interface CheckinRecord {
  id: string;
  workerId?: string;
  workerName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  projectId?: string;
}

function duration(inTime?: string, outTime?: string): string {
  if (!inTime || !outTime) return "—";
  const diff = new Date(outTime).getTime() - new Date(inTime).getTime();
  if (diff < 0) return "—";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function fmt(ts?: string): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function QrCheckinPage() {
  const { projectId } = useWorkspace();
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    apiClient
      .get<CheckinRecord[]>(`/nextenti/tracking/checkins?projectId=${projectId}`)
      .then(setRecords)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">QR check-in</h1>
        <p className="mt-1 text-sm text-slate-500">Worker check-in and check-out records via QR code scanning.</p>
      </div>

      <div className="mt-6">
        {!projectId ? (
          <ErrorState message="Select a project from the top bar to view check-in records." />
        ) : loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : records.length === 0 ? (
          <EmptyState title="No check-ins today" description="Check-in records will appear here as workers scan the site QR code." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Worker", "Check-in", "Check-out", "Duration"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.workerName ?? r.workerId ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(r.checkInTime)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(r.checkOutTime)}</td>
                    <td className="px-4 py-3 text-slate-600">{duration(r.checkInTime, r.checkOutTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">{records.length} record{records.length !== 1 ? "s" : ""}</div>
          </div>
        )}
      </div>
    </>
  );
}
