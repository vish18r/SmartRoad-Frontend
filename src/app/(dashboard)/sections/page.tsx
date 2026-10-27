"use client";
import { useCallback, useEffect, useState } from "react";
import { roadsApi } from "@/lib/api/roads-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useToast } from "@/hooks/useToast";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type {
  RoadResponse,
  RoadSectionResponse,
  RoadCreateRequest,
  RoadSectionCreateRequest,
} from "@/types/road";
import type { ApiError } from "@/types/api";

type RoadForm = RoadCreateRequest;
type SectionForm = RoadSectionCreateRequest;

const emptyRoadForm: RoadForm = { name: "", lengthM: 0, widthM: 0, thicknessMm: 0, startChainage: "", endChainage: "" };
const emptySectionForm: SectionForm = { startChainage: "", endChainage: "", lengthM: 0 };

export default function SectionsPage() {
  const { projectId } = useWorkspace();
  const toast = useToast();
  const [roads, setRoads] = useState<RoadResponse[]>([]);
  const [sectionsMap, setSectionsMap] = useState<Record<string, RoadSectionResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showRoadForm, setShowRoadForm] = useState(false);
  const [editingRoad, setEditingRoad] = useState<RoadResponse | null>(null);
  const [roadForm, setRoadForm] = useState<RoadForm>(emptyRoadForm);
  const [savingRoad, setSavingRoad] = useState(false);
  const [roadFormError, setRoadFormError] = useState("");

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

  useEffect(() => { loadData(); }, [loadData]);

  function openNewRoad() {
    setEditingRoad(null);
    setRoadForm(emptyRoadForm);
    setRoadFormError("");
    setShowRoadForm(true);
  }

  function openEditRoad(road: RoadResponse) {
    setEditingRoad(road);
    setRoadForm({
      name: road.name,
      lengthM: road.lengthM,
      widthM: road.widthM,
      thicknessMm: road.thicknessMm,
      startChainage: road.startChainage ?? "",
      endChainage: road.endChainage ?? "",
    });
    setRoadFormError("");
    setShowRoadForm(true);
  }

  async function handleSaveRoad(e: React.FormEvent) {
    e.preventDefault();
    setSavingRoad(true);
    setRoadFormError("");
    try {
      if (editingRoad) {
        await roadsApi.update(editingRoad.id, roadForm);
        toast.success("Road updated successfully");
      } else {
        if (!projectId) return;
        await roadsApi.create(projectId, roadForm);
        toast.success("Road created successfully");
      }
      setShowRoadForm(false);
      loadData();
    } catch (err) {
      const message = (err as ApiError).message || "Failed to save road.";
      setRoadFormError(message);
      toast.error(message);
    } finally {
      setSavingRoad(false);
    }
  }

  async function handleDeleteRoad(road: RoadResponse) {
    if (!confirm(`Delete road "${road.name}" and all its sections?`)) return;
    try {
      await roadsApi.delete(road.id);
      toast.success("Road deleted successfully");
      loadData();
    } catch (err) {
      toast.error((err as ApiError).message || "Failed to delete road.");
    }
  }

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
      <div className="flex flex-wrap items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Road sections</h1>
          <p className="mt-1 text-sm text-slate-500">Divide projects into chainage sections and monitor planned, completed, and remaining length.</p>
        </div>
        {projectId && (
          <button onClick={openNewRoad} className="rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-fast)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
            + New road
          </button>
        )}
      </div>
      <div className="mt-6">
        {!projectId ? <ErrorState message="Select a project from the top bar to view road sections." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         roads.length === 0 ? <EmptyState title="No roads yet" description="Add roads to this project to manage their sections." /> : (
          <div className="space-y-6">
            {roads.map(road => {
              const sections = sectionsMap[road.id] ?? [];
              return (
                <div key={road.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
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
                      <div className="flex gap-2">
                        <button onClick={() => openNewSection(road.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50">+ Section</button>
                        <button onClick={() => openEditRoad(road)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => handleDeleteRoad(road)} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                  {sections.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          {["From Chainage", "To Chainage", "Length (m)", "Completed (m)", "Remaining (m)", "Progress", "Actions"].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sections.map(s => (
                          <tr key={s.id} className="transition-colors duration-[var(--transition-fast)] hover:bg-slate-50">
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
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <button onClick={() => openEditSection(road.id, s)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                                <button onClick={() => handleDeleteSection(road.id, s)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
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

      {showRoadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editingRoad ? "Edit road" : "New road"}</h2>
              <button onClick={() => setShowRoadForm(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSaveRoad} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  required
                  value={roadForm.name}
                  onChange={(e) => setRoadForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start chainage</label>
                  <input
                    value={roadForm.startChainage ?? ""}
                    onChange={(e) => setRoadForm((f) => ({ ...f, startChainage: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End chainage</label>
                  <input
                    value={roadForm.endChainage ?? ""}
                    onChange={(e) => setRoadForm((f) => ({ ...f, endChainage: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Length (m)</label>
                  <input
                    type="number" step="0.01" required
                    value={roadForm.lengthM}
                    onChange={(e) => setRoadForm((f) => ({ ...f, lengthM: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Width (m)</label>
                  <input
                    type="number" step="0.01"
                    value={roadForm.widthM}
                    onChange={(e) => setRoadForm((f) => ({ ...f, widthM: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thickness (mm)</label>
                  <input
                    type="number" step="0.01"
                    value={roadForm.thicknessMm}
                    onChange={(e) => setRoadForm((f) => ({ ...f, thicknessMm: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>
              {roadFormError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{roadFormError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRoadForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={savingRoad} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                  {savingRoad ? "Saving..." : "Save road"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
