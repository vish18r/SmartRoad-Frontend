"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { organizationsApi } from "@/lib/api";
import type { OrganizationResponse } from "@/types/organization";
import type { ApiError } from "@/types/api";

interface OrganizationRow extends OrganizationResponse {}

const columns: Array<TableColumn<OrganizationRow>> = [
  { key: "name", label: "Name", render: (row) => row.name },
  { key: "legalName", label: "Legal Name", render: (row) => row.legalName || "—" },
  { key: "gst", label: "GST Number", render: (row) => row.gstNumber || "—" },
  { key: "email", label: "Email", render: (row) => row.email || "—" },
  { key: "phone", label: "Phone", render: (row) => row.phoneNumber || "—" },
  { key: "status", label: "Status", render: (row) => (row.active ? "Active" : "Inactive") },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/organizations/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function OrganizationsPage() {
  const [query, setQuery] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await organizationsApi.getMyOrganizations();
        if (response.success && response.data) {
          setOrganizations(response.data);
        } else {
          setError({
            status: 400,
            message: response.message || "Failed to load organizations",
          });
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Organization management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your organizations, members, and settings.</p>
        </div>
        <Link
          href="/organizations/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New organization
        </Link>
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading Organizations" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredOrganizations.length} organization(s) matching "${query}"`
                  : `${organizations.length} organization(s) available`}
              </span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredOrganizations}
                emptyTitle="No organizations available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredOrganizations.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching organizations found" : "No organizations available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredOrganizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organizations/${org.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">{org.name}</h3>
                      {org.legalName && <p className="mt-1 text-xs text-slate-500">{org.legalName}</p>}
                      {org.email && <p className="mt-1 text-xs text-slate-600">{org.email}</p>}
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {org.active ? "✓ Active" : "Inactive"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
