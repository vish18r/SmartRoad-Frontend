"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { projectApi } from "@/lib/api/project-api";
import { Loading, ErrorState } from "@/components/common/states";
import type { ProjectStatus } from "@/types/project";

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    location: "",
    status: "DRAFT" as ProjectStatus,
    budget: "",
    startDate: "",
    endDate: "",
  });
  const [loadError, setLoadError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    projectApi.getById(id)
      .then(p => {
        setForm({
          name: p.name ?? "",
          code: p.code ?? "",
          description: p.description ?? "",
          location: p.location ?? "",
          status: p.status ?? "DRAFT",
          budget: p.budget != null ? String(p.budget) : "",
          startDate: p.startDate ?? "",
          endDate: p.endDate ?? "",
        });
      })
      .catch((e: { message?: string }) => setLoadError(e.message ?? "Failed to load project."))
      .finally(() => setLoadingData(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setSaveError("Project name is required."); return; }
    if (!form.budget || isNaN(Number(form.budget))) { setSaveError("Enter a valid budget amount."); return; }

    setSaving(true); setSaveError("");
    try {
      await projectApi.update(id, {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        status: form.status,
        budget: Number(form.budget),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      setSaveError((err as { message?: string }).message ?? "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) return <div className="mt-10"><Loading /></div>;
  if (loadError) return <div className="mt-10"><ErrorState message={loadError} /></div>;

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-orange-600">Project control</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Edit project</h1>
      <p className="mt-1 text-sm text-slate-500">Update project details below.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Project details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project code</label>
              <input
                value={form.code}
                onChange={e => set("code", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={e => set("location", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Budget & timeline</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              value={form.budget}
              onChange={e => set("budget", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => set("startDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => set("endDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {saveError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
        )}

        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link href={`/projects/${id}`} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
