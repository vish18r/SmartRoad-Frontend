"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { clientsApi } from "@/lib/api";
import type { ClientResponse } from "@/types/client";
import type { ApiError } from "@/types/api";

interface ClientRow extends ClientResponse {}

const columns: Array<TableColumn<ClientRow>> = [
  { key: "name", label: "Client Name", render: (row) => row.name },
  { key: "contact", label: "Contact Person", render: (row) => row.contactPerson || "—" },
  { key: "email", label: "Email", render: (row) => row.email || "—" },
  { key: "phone", label: "Phone", render: (row) => row.phoneNumber || "—" },
  { key: "gst", label: "GST Number", render: (row) => row.gstNumber || "—" },
  { key: "status", label: "Status", render: (row) => (row.active ? "Active" : "Inactive") },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/clients/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrgId = localStorage.getItem("organizationId");
    if (storedOrgId) {
      setOrganizationId(storedOrgId);
    }
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await clientsApi.list(organizationId);
        if (response.success && response.data) {
          setClients(response.data);
        } else {
          setError({
            status: 400,
            message: response.message || "Failed to load clients",
          });
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [organizationId]);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!organizationId) {
    return (
      <ErrorState title="Configuration Error" message="Organization ID not found. Please login again." />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">Client directory</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage client contacts, departments, GST details, projects, contracts, and payment history.
          </p>
        </div>
        <Link href="/clients/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          New client
        </Link>
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading Clients" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredClients.length} client(s) matching "${query}"`
                  : `${clients.length} client(s) available`}
              </span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredClients}
                emptyTitle="No clients available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredClients.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching clients found" : "No clients available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">{client.name}</h3>
                      {client.contactPerson && (
                        <p className="mt-1 text-xs text-slate-500">{client.contactPerson}</p>
                      )}
                      {client.email && <p className="mt-1 text-xs text-slate-600">{client.email}</p>}
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {client.active ? "✓ Active" : "Inactive"}
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
