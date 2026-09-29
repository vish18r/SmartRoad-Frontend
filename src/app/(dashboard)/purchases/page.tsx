"use client";
import { useEffect, useState } from "react";
import { purchaseApi, type PurchaseOrderResponse } from "@/lib/api/purchase-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";
import type { ApiError } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v?: number) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function PurchasesPage() {
  const { organizationId } = useWorkspace();
  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true); setError("");
    purchaseApi.list(organizationId)
      .then(setOrders)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Purchases</h1>
          <p className="mt-1 text-sm text-slate-500">Track supplier purchases, material quantities, invoices, taxes, and payment status.</p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">+ New order</button>
      </div>
      <div className="mt-6">
        {!organizationId ? <ErrorState message="Select an organization from the top bar." /> :
         loading ? <Loading /> : error ? <ErrorState message={error} /> :
         orders.length === 0 ? <EmptyState title="No purchase orders yet" description="Create your first purchase order to get started." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Order #", "Description", "Total Amount", "Status", "Order Date", "Expected Delivery"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{o.orderNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{o.description ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      {o.status ? (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {o.status}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(o.orderDate)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(o.expectedDeliveryDate)}</td>
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
