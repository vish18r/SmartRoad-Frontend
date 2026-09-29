"use client";
import { useEffect, useState } from "react";
import { boqApi } from "@/lib/api/boq-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { BoqResponse, BoqItemResponse } from "@/types/boq";
import type { ApiError } from "@/types/api";

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function BoqPage() {
  const { projectId } = useWorkspace();
  const [boqList, setBoqList] = useState<BoqResponse[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, BoqItemResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError("");
    boqApi.listByProject(projectId)
      .then(async (list) => {
        setBoqList(list);
        const map: Record<string, BoqItemResponse[]> = {};
        await Promise.all(list.map(async b => {
          try { map[b.id] = await boqApi.listItems(b.id); } catch { map[b.id] = []; }
        }));
        setItemsMap(map);
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">BOQ</h1>
          <p className="mt-1 text-sm text-slate-500">Compare estimated and actual quantities, rates, amounts, and variance.</p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ New BOQ</button>
      </div>
      <div className="mt-6">
        {!projectId ? <ErrorState message="Select a project from the top bar to view its BOQ." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         boqList.length === 0 ? <EmptyState title="No BOQ yet" description="Create a BOQ for this project to get started." /> : (
          <div className="space-y-6">
            {boqList.map(boq => {
              const items = itemsMap[boq.id] ?? [];
              const totalEstimated = items.reduce((s, i) => s + (i.estimatedAmount ?? 0), 0);
              const totalActual = items.reduce((s, i) => s + (i.actualAmount ?? 0), 0);
              return (
                <div key={boq.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{boq.name}</p>
                      {boq.description && <p className="text-xs text-slate-500">{boq.description}</p>}
                    </div>
                    <div className="flex gap-6 text-right text-sm">
                      <div><p className="text-xs text-slate-500">Estimated</p><p className="font-semibold text-slate-800">{formatCurrency(totalEstimated)}</p></div>
                      <div><p className="text-xs text-slate-500">Actual</p><p className="font-semibold text-slate-800">{formatCurrency(totalActual)}</p></div>
                    </div>
                  </div>
                  {items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100">
                        <tr>
                          {["Code", "Description", "Unit", "Est. Qty", "Rate", "Est. Amount", "Act. Amount", "Variance"].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-600">{item.itemCode ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-800">{item.description ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-600">{item.unit ?? "—"}</td>
                            <td className="px-4 py-2 text-slate-700">{item.estimatedQuantity}</td>
                            <td className="px-4 py-2 text-slate-700">{formatCurrency(item.rate)}</td>
                            <td className="px-4 py-2 text-slate-700">{formatCurrency(item.estimatedAmount)}</td>
                            <td className="px-4 py-2 text-slate-700">{formatCurrency(item.actualAmount)}</td>
                            <td className="px-4 py-2">
                              {item.costVariance != null ? (
                                <span className={item.costVariance > 0 ? "text-red-600" : "text-green-600"}>
                                  {formatCurrency(Math.abs(item.costVariance))} {item.costVariance > 0 ? "over" : "under"}
                                </span>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-4 py-4 text-sm text-slate-400">No items in this BOQ.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
