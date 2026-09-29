"use client";

import { useEffect, useState } from "react";
import { vendorApi, type VendorResponse } from "@/lib/api/vendor-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Loading, ErrorState, EmptyState } from "@/components/common/states";

export default function SuppliersPage() {
  const { organizationId } = useWorkspace();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    setError("");
    vendorApi
      .list(organizationId)
      .then(setVendors)
      .catch((e: any) => setError(e.message || "Failed to load suppliers"))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const filtered = vendors.filter((v) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      v.vendorName.toLowerCase().includes(t) ||
      (v.contactPerson ?? "").toLowerCase().includes(t) ||
      (v.city ?? "").toLowerCase().includes(t) ||
      (v.gstNumber ?? "").toLowerCase().includes(t)
    );
  });

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage supplier contacts, GST details, purchase history, and outstanding payments.
          </p>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
          + New supplier
        </button>
      </div>

      {!organizationId ? (
        <div className="mt-6">
          <ErrorState message="Select an organization from the top bar." />
        </div>
      ) : (
        <>
          <div className="mt-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact, city or GST..."
              className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="mt-4">
            {loading ? (
              <Loading />
            ) : error ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No suppliers yet"
                description="Add your first supplier to start managing vendor relationships."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {["Name", "Contact", "Phone", "City", "GST", "Type", "Status"].map((h) => (
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
                    {filtered.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{v.vendorName}</td>
                        <td className="px-4 py-3 text-slate-600">{v.contactPerson ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{v.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{v.city ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.gstNumber ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{v.vendorType?.toLowerCase() ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              v.isActive === false
                                ? "bg-slate-100 text-slate-600"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {v.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  {filtered.length} supplier{filtered.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
