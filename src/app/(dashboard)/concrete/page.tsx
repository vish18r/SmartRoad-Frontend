"use client";

import { useCallback, useEffect, useState } from "react";
import { roadsApi } from "@/lib/api/roads-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useToast } from "@/hooks/useToast";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { RoadResponse, RoadSectionResponse, RoadSectionCreateRequest } from "@/types/road";
import type { ApiError } from "@/types/api";

// NOTE: the backend has no separate "concrete work" entity — RoadSectionRequestDTO /
// RoadSectionResponseDTO (see RoadController) expose only startChainage, endChainage,
// lengthM, completedLengthM, remainingLengthM and completionPercentage, with no
// work-type/category field to filter on. This page is therefore a themed read+CRUD
// view over the same road sections as /sections, reusing the same create/edit/delete
// actions rather than inventing a duplicate entity.
type SectionForm = RoadSectionCreateRequest;

const emptySectionForm: SectionForm = { startChainage: "", endChainage: "", lengthM: 0 };

export default function ConcretePage() {
  const { projectId } = useWorkspace();
  const toast = useToast();
  const [roads, setRoads] = useState<RoadResponse[]>([]);
  const [sections, setSections] = useState<Record<string, RoadSectionResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionRoadId, setSectionRoadId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<RoadSectionResponse | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm>(emptySectionForm);
  const [savingSection, setSavingSection] = useState(false);
  const [sectionFormError, setSectionFormError] = useState("");

  const loadData = useCallback(() => {
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

  useEffect(() => { loadData(); }, [loadData]);

  const allSections = Object.values(sections).flat();
  const totalLength = allSections.reduce((s, sec) => s + (sec.lengthM ?? 0), 0);
  const completedLength = allSections.reduce((s, sec) => s + (sec.completedLengthM ?? 0), 0);
  const completionPct = totalLength > 0 ? Math.round((completedLength / totalLength) * 100) : 0;

  function openNewSection(roadId: string) {
    setSectionRoadId(roadId);
    setEditingSection(null);
    setSectionForm(emptySectionForm);
    setSectionFormError("");
    setShowSectionForm(true);
  }

  function openEditSection(roadId: string, section: RoadSectionResponse) {
    setSectionRoadId(roadId);
    setEditingSection(section);
    setSectionForm({
      startChainage: section.startChainage ?? "",
      endChainage: section.endChainage ?? "",
      lengthM: section.lengthM,
    });
    setSectionFormError("");
    setShowSectionForm(true);
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionRoadId) return;
    setSavingSection(true);
    setSectionFormError("");
    try {
      if (editingSection) {
        await roadsApi.updateSection(sectionRoadId, editingSection.id, sectionForm);
        toast.success("Section updated successfully");
      } else {
        await roadsApi.createSection(sectionRoadId, sectionForm);
        toast.success("Section created successfully");
      }
      setShowSectionForm(false);
      loadData();
    } catch (err) {
      const message = (err as ApiError).message || "Failed to save section.";
      setSectionFormError(message);
      toast.error(message);
    } finally {
      setSavingSection(false);
    }
  }

  async function handleDeleteSection(roadId: string, section: RoadSectionResponse) {
    if (!confirm("Delete this section?")) return;
    try {
      await roadsApi.deleteSection(roadId, section.id);
      toast.success("Section deleted successfully");
      loadData();
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to delete section.");
    }
  }

  return (
    <>
      <div className="animate-fade-in-up">
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Concrete work</h1>
        <p className="mt-1 text-sm text-slate-500">Track road sections, chainage, and completion progress.</p>
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total length</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalLength.toFixed(2)} m</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{completedLength.toFixed(2)} m</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
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
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{road.name}</p>
                        {road.startChainage && road.endChainage && (
                          <p className="text-xs text-slate-400">{road.startChainage} – {road.endChainage}</p>
                        )}
                      </div>
                      <button onClick={() => openNewSection(road.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50">+ Section</button>
                    </div>
                    {(sections[road.id] ?? []).length === 0 ? (
                      <p className="px-5 py-4 text-sm text-slate-400">No sections defined.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            {["From Chainage", "To Chainage", "Length (m)", "Completed (m)", "Remaining (m)", "Progress", "Actions"].map(h => (
                              <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(sections[road.id] ?? []).map(sec => (
                            <tr key={sec.id} className="transition-colors duration-[var(--transition-fast)] hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-600">{sec.startChainage ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.endChainage ?? "—"}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.lengthM}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.completedLengthM}</td>
                              <td className="px-4 py-3 text-slate-600">{sec.remainingLengthM}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${sec.completionPercentage}%` }} />
                                  </div>
                                  <span className="text-xs text-slate-600">{sec.completionPercentage.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => openEditSection(road.id, sec)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                                  <button onClick={() => handleDeleteSection(road.id, sec)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                                </div>
                              </td>
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

      {showSectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editingSection ? "Edit section" : "New section"}</h2>
              <button onClick={() => setShowSectionForm(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start chainage</label>
                  <input
                    required
                    value={sectionForm.startChainage ?? ""}
                    onChange={(e) => setSectionForm((f) => ({ ...f, startChainage: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End chainage</label>
                  <input
                    required
                    value={sectionForm.endChainage ?? ""}
                    onChange={(e) => setSectionForm((f) => ({ ...f, endChainage: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Length (m)</label>
                <input
                  type="number" step="0.01" required
                  value={sectionForm.lengthM}
                  onChange={(e) => setSectionForm((f) => ({ ...f, lengthM: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                />
              </div>
              {sectionFormError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{sectionFormError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSectionForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={savingSection} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                  {savingSection ? "Saving..." : "Save section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
