"use client";
import { useEffect, useState } from "react";
import { clientsApi } from "@/lib/api/clients-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ClientResponse } from "@/types/client";
import type { ApiError } from "@/types/api";

export default function ClientsPage() {
  const { organizationId } = useWorkspace();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true); setError("");
    clientsApi.list(organizationId)
      .then(setClients)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">Manage client contacts, departments, GST details, projects, contracts, and payment history.</p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ New client</button>
      </div>
      <div className="mt-6">
        {!organizationId ? <ErrorState message="Select an organization from the top bar." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         clients.length === 0 ? <EmptyState title="No clients yet" description="Add your first client to get started." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Name", "Contact Person", "Email", "Phone", "GST No.", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
