"use client";

import { useEffect, useState, useCallback } from "react";
import { siteDiaryApi, type SiteDiaryEntry, type SiteDiaryRequest } from "@/lib/api/site-diary-api";
import { projectApi } from "@/lib/api/project-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import type { ProjectResponse } from "@/types/project";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ApiError } from "@/types/api";

const WEATHER_OPTIONS = ["Sunny", "Cloudy", "Partly Cloudy", "Rainy", "Stormy", "Foggy", "Windy"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function SiteDiaryPage() {
  const { organizationId } = useWorkspace();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [entries, setEntries] = useState<SiteDiaryEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [entriesError, setEntriesError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState<SiteDiaryRequest>({
    projectId: "",
    diaryDate: today(),
    weather: "",
    temperatureCelsius: undefined,
    siteConditions: "",
    workSummary: "",
    issues: "",
    safetyNotes: "",
    notes: "",
  });

  useEffect(() => {
    if (!organizationId) return;
    projectApi.list(organizationId)
      .then((data) => {
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].id);
      })
      .catch((e: ApiError) => setProjectsError(e.message));
  }, [organizationId]);

  const loadEntries = useCallback(() => {
    if (!selectedProjectId) return;
    setLoadingEntries(true);
    setEntriesError("");
    siteDiaryApi.getEntries(selectedProjectId)
      .then(setEntries)
      .catch((e: ApiError) => setEntriesError(e.message))
      .finally(() => setLoadingEntries(false));
  }, [selectedProjectId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  function openNewEntry() {
    setForm({ projectId: selectedProjectId, diaryDate: today(), weather: "", temperatureCelsius: undefined, siteConditions: "", workSummary: "", issues: "", safetyNotes: "", notes: "" });
    setSaveError("");
    setShowForm(true);
  }

  function openEditEntry(entry: SiteDiaryEntry) {
    setForm({
      projectId: entry.projectId,
      diaryDate: entry.diaryDate,
      weather: entry.weather ?? "",
      temperatureCelsius: entry.temperatureCelsius,
      siteConditions: entry.siteConditions ?? "",
      workSummary: entry.workSummary ?? "",
      issues: entry.issues ?? "",
      safetyNotes: entry.safetyNotes ?? "",
      notes: entry.notes ?? "",
    });
    setSaveError("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await siteDiaryApi.saveEntry(form);
      setShowForm(false);
      loadEntries();
    } catch (e) {
      setSaveError((e as ApiError).message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this diary entry?")) return;
    try {
      await siteDiaryApi.deleteEntry(id);
      loadEntries();
    } catch { /* ignore */ }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Daily site diary</h1>
          <p className="mt-1 text-sm text-slate-500">Capture daily weather, people, machines, materials, completed work, issues, safety, photos, and notes.</p>
        </div>
        {selectedProjectId && (
          <button onClick={openNewEntry} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            + New entry
          </button>
        )}
      </div>

      {!organizationId && (
        <div className="mt-6"><ErrorState message="Select an organization from the top bar to view site diary entries." /></div>
      )}

      {organizationId && (
        <>
          {projectsError && <div className="mt-4"><ErrorState message={projectsError} /></div>}

          {projects.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-6">
            {loadingEntries ? <Loading /> : entriesError ? <ErrorState message={entriesError} /> : entries.length === 0 ? (
              <EmptyState title="No diary entries yet" description="Click '+ New entry' to record today's site activity." />
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{formatDate(entry.diaryDate)}</p>
                        {entry.weather && <p className="text-sm text-slate-500">{entry.weather}{entry.temperatureCelsius != null ? ` · ${entry.temperatureCelsius}°C` : ""}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditEntry(entry)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => handleDelete(entry.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                    {entry.workSummary && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Work summary</p>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{entry.workSummary}</p>
                      </div>
                    )}
                    {entry.siteConditions && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Site conditions</p>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{entry.siteConditions}</p>
                      </div>
                    )}
                    {entry.issues && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-red-400">Issues</p>
                        <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{entry.issues}</p>
                      </div>
                    )}
                    {entry.safetyNotes && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Safety notes</p>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{entry.safetyNotes}</p>
                      </div>
                    )}
                    {entry.notes && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Site diary entry</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.diaryDate}
                    onChange={(e) => setForm((f) => ({ ...f, diaryDate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weather</label>
                  <select
                    value={form.weather}
                    onChange={(e) => setForm((f) => ({ ...f, weather: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select...</option>
                    {WEATHER_OPTIONS.map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperatureCelsius ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, temperatureCelsius: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 32.5"
                />
              </div>

              {(["siteConditions", "workSummary", "issues", "safetyNotes", "notes"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                    {field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </label>
                  <textarea
                    rows={3}
                    value={form[field] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>
              ))}

              {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
