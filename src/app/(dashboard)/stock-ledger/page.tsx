"use client";

import { useEffect, useState } from "react";
import { materialApi } from "@/lib/api";
import { apiClient } from "@/lib/api/api-client";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";

interface LedgerEntry {
  id: string;
  transactionType: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  referenceNumber?: string;
  notes?: string;
  transactionDate?: string;
  createdDate?: string;
}

export default function StockLedgerPage() {
  const { organizationId, projectId } = useWorkspace();
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoadingMaterials(true);
    materialApi
      .list(undefined, undefined, undefined)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.content ?? [];
        setMaterials(list);
        if (list.length > 0) setSelectedMaterialId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingMaterials(false));
  }, [organizationId]);

  useEffect(() => {
    if (!selectedMaterialId) return;
    setLoadingLedger(true);
    setError("");
    apiClient
      .get<any>(`/materials/${selectedMaterialId}/stock-ledger`)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.content ?? [];
        setLedger(list);
      })
      .catch((e: any) => setError(e.message || "Failed to load ledger"))
      .finally(() => setLoadingLedger(false));
  }, [selectedMaterialId]);

  const txColors: Record<string, string> = {
    PURCHASE: "bg-green-100 text-green-700",
    USAGE: "bg-red-100 text-red-700",
    TRANSFER_IN: "bg-blue-100 text-blue-700",
    TRANSFER_OUT: "bg-orange-100 text-orange-700",
    ADJUSTMENT: "bg-slate-100 text-slate-600",
    WASTAGE: "bg-yellow-100 text-yellow-700",
  };

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Material stock ledger</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reconcile opening stock, purchases, transfers, usage, and closing stock.
        </p>
      </div>

      {!organizationId ? (
        <div className="mt-6">
          <ErrorState message="Select an organization from the top bar." />
        </div>
      ) : (
        <>
          <div className="mt-5">
            {loadingMaterials ? (
              <Loading />
            ) : materials.length === 0 ? (
              <EmptyState
                title="No materials"
                description="Add materials to the organization to view stock ledger."
              />
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select material</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.materialName} ({m.unit})
                    </option>
                  ))}
                </select>

                <div className="mt-5">
                  {loadingLedger ? (
                    <Loading />
                  ) : error ? (
                    <ErrorState message={error} />
                  ) : ledger.length === 0 ? (
                    <EmptyState
                      title="No ledger entries"
                      description="No stock movements recorded for this material yet."
                    />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                          <tr>
                            {["Date", "Type", "Qty", "Unit Cost", "Total", "Reference", "Notes"].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ledger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-600">
                                {entry.transactionDate
                                  ? new Date(entry.transactionDate).toLocaleDateString("en-IN")
                                  : entry.createdDate
                                  ? new Date(entry.createdDate).toLocaleDateString("en-IN")
                                  : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    txColors[entry.transactionType] ?? "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {entry.transactionType?.replace(/_/g, " ") ?? "—"}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900">{entry.quantity}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {entry.unitCost != null ? `₹${entry.unitCost.toFixed(2)}` : "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {entry.totalCost != null ? `₹${entry.totalCost.toFixed(2)}` : "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                                {entry.referenceNumber ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                                {entry.notes ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                        {ledger.length} entr{ledger.length !== 1 ? "ies" : "y"}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
