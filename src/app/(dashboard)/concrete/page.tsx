"use client";

import { useEffect, useState } from "react";
import { roadsApi } from "@/lib/api/roads-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { RoadResponse, RoadSectionResponse } from "@/types/road";
import type { ApiError } from "@/types/api";

export default function ConcretePage() {
  const { projectId } = useWorkspace();
  const [roads, setRoads] = useState<RoadResponse[]>([]);
  const [sections, setSections] = useState<Record<string, RoadSectionResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError("");
    roadsApi.listByProject(projectId)
      .then(async (roadList) => {
        setRoads(roadList);
        const entries = await Promise.all(
          roadList.map(r => roadsApi.listSections(r.id).then(s => [r.id, s] as const))
        );
        setSections(Object.fromEntries(entries));
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  const allSections = Object.values(sections).flat();
  const totalLength = allSections.reduce((s, sec) => s + (sec.length ?? 0), 0);
  const completedLength = allSections.filter(s => s.status === "COMPLETED").reduce((s, sec) => s + (sec.length ?? 0), 0);
  const completionPct = totalLength > 0 ? Math.round((completedLength / totalLength) * 100) : 0;

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Concrete work</h1>
        <p className="mt-1 text-sm text-slate-500">Track concrete sections, quantities, materials, labour, machines, supervisors, and completion.</p>
      </div>

      {!projectId ? (
        <div className="mt-6"><ErrorState message="Select a project from the top bar to view concrete work." /></div>
      ) : loading ? (
        <div className="mt-6"><Loading /></div>
      ) : error ? (
        <div className="mt-6"><ErrorState message={error} /></div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total length</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalLength.toFixed(2)} m</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{completedLength.toFixed(2)} m</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completion</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{completionPct}%</p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </section>

          <div className="mt-6">
            {roads.length === 0 ? (
              <EmptyState title="No roads yet" description="Add roads to this project to track concrete work sections." />
            ) : (
              <div className="space-y-4">
                {roads.map(road => (
                  <div key={road.id} className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-3">
                      <p className="font-semibold text-slate-900">{road.name}</p>
                      {road.roadCode && <p className="text-xs text-slate-400">{road.roadCode}</p>}
                    </div>
                    {(sections[road.id] ?? []).length === 0 ? (
                      <p className="px-5 py-4 text-sm text-slate-400">No sections defined.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {["Section", "From (m)", "To (m)", "Length (m)", "Status", "Progress"].map(h => (
                              <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(sections[road.id] ?? []).map(sec => (
                            <tr key={sec.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-900">{sec.name ?? `Section`}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.chainageFrom ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.chainageTo ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.length ?? "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sec.status === "COMPLETED" ? "bg-green-100 text-green-700" : sec.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                                  {sec.status ?? "Pending"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{sec.progress != null ? `${sec.progress}%` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
