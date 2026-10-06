"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { contractApi } from "@/lib/api/contract-api";
import { projectApi } from "@/lib/api/project-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import type { ProjectResponse } from "@/types/project";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function NewContractPage() {
  const router = useRouter();
  const { organizationId, projectId } = useWorkspace();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [form, setForm] = useState({
    projectId: projectId ?? "",
    contractNumber: "",
    workOrderNumber: "",
    agreementNumber: "",
    contractValue: "",
    securityDeposit: "",
    retentionPercentage: "",
    startDate: "",
    endDate: "",
    documentReference: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    projectApi.list(organizationId).then(setProjects).catch(() => setProjects([]));
  }, [organizationId]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.projectId) { setError("Select a project."); return; }
    if (!form.contractNumber.trim()) { setError("Contract number is required."); return; }
    if (form.contractValue && Number(form.contractValue) <= 0) { setError("Contract value must be greater than zero."); return; }

    const num = (v: string) => (v === "" ? undefined : Number(v));
    setSaving(true); setError("");
    try {
      await contractApi.create({
        projectId: form.projectId,
        contractNumber: form.contractNumber.trim(),
        workOrderNumber: form.workOrderNumber.trim() || undefined,
        agreementNumber: form.agreementNumber.trim() || undefined,
        contractValue: num(form.contractValue),
        securityDeposit: num(form.securityDeposit),
        retentionPercentage: num(form.retentionPercentage),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        documentReference: form.documentReference.trim() || undefined,
      });
      router.push("/contracts");
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to create contract.");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, name: keyof typeof form, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input value={form[name]} onChange={e => set(name, e.target.value)} className={INPUT} {...props} />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-orange-600">Smart Road</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Create contract</h1>
      <p className="mt-1 text-sm text-slate-500">Add a contract to one of your projects.</p>

      {!organizationId && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Select an organization from the top bar before creating a contract.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Contract details</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Project <span className="text-red-500">*</span></label>
            <select value={form.projectId} onChange={e => set("projectId", e.target.value)} className={INPUT}>
              <option value="">{projects.length ? "Select project" : "No projects in this organization"}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Contract number *", "contractNumber", { placeholder: "CT-2026-001" })}
            {field("Work order number", "workOrderNumber")}
            {field("Agreement number", "agreementNumber")}
            {field("Document reference", "documentReference")}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Value & timeline</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {field("Contract value (₹)", "contractValue", { type: "number", min: "0" })}
            {field("Security deposit (₹)", "securityDeposit", { type: "number", min: "0" })}
            {field("Retention (%)", "retentionPercentage", { type: "number", min: "0", max: "100" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Start date", "startDate", { type: "date" })}
            {field("End date", "endDate", { type: "date" })}
          </div>
        </section>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || !organizationId} className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
            {saving ? "Creating..." : "Create contract"}
          </button>
          <Link href="/contracts" className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
