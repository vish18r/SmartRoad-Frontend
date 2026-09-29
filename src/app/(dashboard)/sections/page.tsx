"use client";
import { useEffect, useState } from "react";
import { roadsApi } from "@/lib/api/roads-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { RoadResponse, RoadSectionResponse } from "@/types/road";
import type { ApiError } from "@/types/api";

export default function SectionsPage() {
  const { projectId } = useWorkspace();
  const [roads, setRoads] = useState<RoadResponse[]>([]);
  const [sectionsMap, setSectionsMap] = useState<Record<string, RoadSectionResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError("");
    roadsApi.listByProject(projectId)
      .then(async (list) => {
        setRoads(list);
        const map: Record<string, RoadSectionResponse[]> = {};
        await Promise.all(list.map(async r => {
          try { map[r.id] = await roadsApi.listSections(r.id); } catch { map[r.id] = []; }
        }));
        setSectionsMap(map);
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Road sections</h1>
        <p className="mt-1 text-sm text-slate-500">Divide projects into chainage sections and monitor planned, completed, and remaining length.</p>
      </div>
      <div className="mt-6">
        {!projectId ? <ErrorState message="Select a project from the top bar to view road sections." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         roads.length === 0 ? <EmptyState title="No roads yet" description="Add roads to this project to manage their sections." /> : (
          <div className="space-y-6">
            {roads.map(road => {
              const sections = sectionsMap[road.id] ?? [];
              return (
                <div key={road.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{road.name}</p>
                      <p className="text-xs text-slate-500">
                        {road.startChainage && road.endChainage ? `${road.startChainage} – ${road.endChainage} · ` : ""}
                        {road.lengthM}m · {road.widthM}m wide
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Completion</p>
                        <p className="font-semibold text-slate-800">{road.completionPercentage.toFixed(1)}%</p>
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-orange-500" style={{ width: `${road.completionPercentage}%` }} />
                      </div>
                    </div>
                  </div>
                  {sections.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          {["From Chainage", "To Chainage", "Length (m)", "Completed (m)", "Remaining (m)", "Progress"].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sections.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-700">{s.startChainage ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-700">{s.endChainage ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-700">{s.lengthM}</td>
                            <td className="px-4 py-2 text-slate-700">{s.completedLengthM}</td>
                            <td className="px-4 py-2 text-slate-700">{s.remainingLengthM}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${s.completionPercentage}%` }} />
                                </div>
                                <span className="text-xs text-slate-600">{s.completionPercentage.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-4 py-4 text-sm text-slate-400">No sections defined for this road.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
