"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectApi } from "@/lib/api/project-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import type { ProjectStatus } from "@/types/project";

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { organizationId } = useWorkspace();

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) { setError("Select an organization from the top bar first."); return; }
    if (!form.name.trim()) { setError("Project name is required."); return; }
    if (!form.budget || isNaN(Number(form.budget))) { setError("Enter a valid budget amount."); return; }

    setSaving(true); setError("");
    try {
      await projectApi.create({
        organizationId,
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        status: form.status,
        budget: Number(form.budget),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      router.push("/projects");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to create project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-orange-600">Project control</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Create project</h1>
      <p className="mt-1 text-sm text-slate-500">Add a new project to your organization.</p>

      {!organizationId && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Select an organization from the top bar before creating a project.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Project details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Highway widening phase 2"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project code</label>
              <input
                value={form.code}
                onChange={e => set("code", e.target.value)}
                placeholder="HW-2024-001"
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
              placeholder="Brief description of the project scope..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={e => set("location", e.target.value)}
                placeholder="NH-48, Karnataka"
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
              placeholder="5000000"
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

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            disabled={saving || !organizationId}
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create project"}
          </button>
          <Link href="/projects" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
