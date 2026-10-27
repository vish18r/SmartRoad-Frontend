"use client";
import { useState } from "react";
import { clientsApi } from "@/lib/api/clients-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ClientResponse, ClientCreateRequest } from "@/types/client";

const EMPTY_FORM: Omit<ClientCreateRequest, "organizationId"> = {
  name: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  gstNumber: "",
  address: "",
};

export default function ClientsPage() {
  const { organizationId } = useWorkspace();
  const toast = useToast();

  const { data, loading, error, refetch } = useApi(
    () => clientsApi.list(organizationId as string),
    {
      skip: !organizationId,
      deps: [organizationId],
      onError: (err) => toast.error(err.message || "Failed to load clients"),
    }
  );
  const clients = data || [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ClientCreateRequest, "organizationId">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const openNewClient = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError("");
    setShowForm(true);
  };

  const openEditClient = (c: ClientResponse) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      contactPerson: c.contactPerson ?? "",
      email: c.email ?? "",
      phoneNumber: c.phoneNumber ?? "",
      gstNumber: c.gstNumber ?? "",
      address: c.address ?? "",
    });
    setSaveError("");
    setShowForm(true);
  };

  const buildPayload = (): ClientCreateRequest => ({
    organizationId: organizationId as string,
    name: form.name,
    contactPerson: form.contactPerson || undefined,
    email: form.email || undefined,
    phoneNumber: form.phoneNumber || undefined,
    gstNumber: form.gstNumber || undefined,
    address: form.address || undefined,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = buildPayload();
      if (editingId) {
        await clientsApi.update(editingId, organizationId, payload);
        toast.success("Client updated successfully");
      } else {
        await clientsApi.create(organizationId, payload);
        toast.success("Client created successfully");
      }
      setShowForm(false);
      await refetch();
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to save client";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!organizationId) return;
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await clientsApi.delete(id, organizationId);
      toast.success("Client deleted successfully");
      refetch();
    } catch (err) {
      const message = (err as { message?: string })?.message || "Failed to delete client";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">Manage client contacts, departments, GST details, projects, contracts, and payment history.</p>
        </div>
        <button
          onClick={openNewClient}
          disabled={!organizationId}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          + New client
        </button>
      </div>
      <div className="mt-6">
        {!organizationId ? <ErrorState message="Select an organization from the top bar." /> :
         loading ? <Loading /> : error ? <ErrorState message={error.message} /> :
         clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add your first client to get started."
            action={
              <button onClick={openNewClient} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                + New client
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Name", "Contact Person", "Email", "Phone", "GST No.", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(c => (
                  <tr key={c.id} className="transition-colors duration-[var(--transition-fast)] hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.contactPerson ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.phoneNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.gstNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditClient(c)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit</button>
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
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit client" : "New client"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    maxLength={255}
                    value={form.contactPerson ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    maxLength={32}
                    value={form.phoneNumber ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    maxLength={32}
                    value={form.gstNumber ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, gstNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={form.address ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)] resize-none"
                />
              </div>

              {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
