"use client";
import { useState } from "react";
import { contractApi } from "@/lib/api/contract-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ContractResponse, ContractCreateRequest } from "@/types/contract";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-600",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN")}`;
}

const EMPTY_FORM: ContractCreateRequest = {
  projectId: "",
  contractNumber: "",
  clientId: "",
  contractorId: "",
  workOrderNumber: "",
  agreementNumber: "",
  contractValue: undefined,
  startDate: "",
  endDate: "",
  securityDeposit: undefined,
  retentionPercentage: undefined,
  documentReference: "",
};

export default function ContractsPage() {
  const { organizationId, projectId } = useWorkspace();
  const toast = useToast();

  const { data, loading, error, refetch } = useApi(
    () => contractApi.list(projectId || undefined),
    {
      skip: !organizationId,
      deps: [organizationId, projectId],
      onError: (err) => toast.error(err.message || "Failed to load contracts"),
    }
  );
  const contracts = data || [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractCreateRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const openNewContract = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, projectId: projectId || "" });
    setSaveError("");
    setShowForm(true);
  };

  const openEditContract = (c: ContractResponse) => {
    setEditingId(c.id);
    setForm({
      projectId: c.projectId,
      contractNumber: c.contractNumber,
      clientId: c.clientId ?? "",
      contractorId: c.contractorId ?? "",
      workOrderNumber: c.workOrderNumber ?? "",
      agreementNumber: c.agreementNumber ?? "",
      contractValue: c.contractValue,
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      securityDeposit: c.securityDeposit,
      retentionPercentage: c.retentionPercentage,
      documentReference: c.documentReference ?? "",
    });
    setSaveError("");
    setShowForm(true);
  };

  const buildPayload = (): ContractCreateRequest => ({
    ...form,
    clientId: form.clientId || undefined,
    contractorId: form.contractorId || undefined,
    workOrderNumber: form.workOrderNumber || undefined,
    agreementNumber: form.agreementNumber || undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    documentReference: form.documentReference || undefined,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const payload = buildPayload();
      if (editingId) {
        await contractApi.update(editingId, payload);
        toast.success("Contract updated successfully");
      } else {
        await contractApi.create(payload);
        toast.success("Contract created successfully");
      }
      setShowForm(false);
      await refetch();
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to save contract";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    try {
      await contractApi.delete(id);
      toast.success("Contract deleted successfully");
      refetch();
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to delete contract";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="mt-1 text-sm text-slate-500">Manage contract terms, work orders, values, dates, payment terms, and documents.</p>
        </div>
        <button
          onClick={openNewContract}
          disabled={!organizationId}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          + New contract
        </button>
      </div>
      <div className="mt-6">
        {!organizationId ? <ErrorState message="Select an organization from the top bar." /> :
         loading ? <Loading /> : error ? <ErrorState message={error.message} /> :
         contracts.length === 0 ? (
          <EmptyState
            title="No contracts yet"
            description="Add your first contract to get started."
            action={
              <button onClick={openNewContract} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                + New contract
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Contract No.", "Work Order", "Value", "Status", "Start Date", "End Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(c => (
                  <tr key={c.id} className="transition-colors duration-[var(--transition-fast)] hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.contractNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{c.workOrderNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-900">{formatCurrency(c.contractValue)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(c.startDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(c.endDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditContract(c)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit contract" : "New contract"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project ID *</label>
                  <input
                    type="text"
                    required
                    value={form.projectId}
                    onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contract Number *</label>
                  <input
                    type="text"
                    required
                    value={form.contractNumber}
                    onChange={(e) => setForm((f) => ({ ...f, contractNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={form.clientId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contractor ID</label>
                  <input
                    type="text"
                    value={form.contractorId ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, contractorId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Work Order Number</label>
                  <input
                    type="text"
                    value={form.workOrderNumber ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, workOrderNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agreement Number</label>
                  <input
                    type="text"
                    value={form.agreementNumber ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, agreementNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contract Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.contractValue ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, contractValue: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.securityDeposit ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, securityDeposit: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Retention %</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.retentionPercentage ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, retentionPercentage: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Reference</label>
                <input
                  type="text"
                  value={form.documentReference ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, documentReference: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                />
              </div>

              {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
