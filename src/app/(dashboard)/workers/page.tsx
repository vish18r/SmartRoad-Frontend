"use client";

import { useEffect, useState } from "react";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { WorkerResponse } from "@/types/worker";
import type { ApiError } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
  on_leave: "bg-yellow-100 text-yellow-700",
  suspended: "bg-orange-100 text-orange-700",
  terminated: "bg-red-100 text-red-700",
};

export default function WorkersPage() {
  const { organizationId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true); setError("");
    workersApi.list(organizationId)
      .then(setWorkers)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const filtered = workers.filter((w) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      w.firstName.toLowerCase().includes(t) ||
      (w.lastName ?? "").toLowerCase().includes(t) ||
      (w.role ?? "").toLowerCase().includes(t) ||
      (w.phoneNumber ?? "").includes(t)
    );
  });

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Workers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage workforce details and site assignments.</p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ New worker</button>
      </div>

      {!organizationId ? (
        <div className="mt-6"><ErrorState message="Select an organization from the top bar." /></div>
      ) : (
        <>
          <div className="mt-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or phone..."
              className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="mt-4">
            {loading ? <Loading /> : error ? <ErrorState message={error} /> :
             filtered.length === 0 ? (
              <EmptyState title="No workers found" description="Add workers to start tracking your workforce." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {["Name", "Role", "Phone", "Status", "Joining Date"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{w.firstName} {w.lastName ?? ""}</td>
                        <td className="px-4 py-3 text-slate-600">{w.role ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{w.phoneNumber ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[w.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {w.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{w.joiningDate ? new Date(w.joiningDate).toLocaleDateString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">{filtered.length} worker{filtered.length !== 1 ? "s" : ""}</div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
