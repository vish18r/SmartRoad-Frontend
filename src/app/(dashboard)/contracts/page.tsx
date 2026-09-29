"use client";
import { useEffect, useState } from "react";
import { contractApi } from "@/lib/api/contract-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ContractResponse } from "@/types/contract";
import type { ApiError } from "@/types/api";

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

export default function ContractsPage() {
  const { organizationId } = useWorkspace();
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true); setError("");
    contractApi.list()
      .then(setContracts)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="mt-1 text-sm text-slate-500">Manage contract terms, work orders, values, dates, payment terms, and documents.</p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ New contract</button>
      </div>
      <div className="mt-6">
        {!organizationId ? <ErrorState message="Select an organization from the top bar." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         contracts.length === 0 ? <EmptyState title="No contracts yet" description="Add your first contract to get started." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Contract No.", "Work Order", "Value", "Status", "Start Date", "End Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
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
