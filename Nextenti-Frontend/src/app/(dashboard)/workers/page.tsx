"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { workersApi } from "@/lib/api";
import type { WorkerResponse } from "@/types/worker";
import type { ApiError } from "@/types/api";

interface WorkerRow extends WorkerResponse {}

const columns: Array<TableColumn<WorkerRow>> = [
  { key: "name", label: "Name", render: (row) => `${row.firstName} ${row.lastName || ""}`.trim() },
  { key: "email", label: "Email", render: (row) => row.email || "—" },
  { key: "phone", label: "Phone", render: (row) => row.phoneNumber || "—" },
  { key: "status", label: "Status", render: (row) => row.status || "ACTIVE" },
  { key: "joinDate", label: "Join Date", render: (row) => row.joinDate ? new Date(row.joinDate).toLocaleDateString() : "—" },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/workers/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function WorkersPage() {
  const [query, setQuery] = useState("");
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
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

    const fetchWorkers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await workersApi.list(organizationId);
        if (response.success && response.data) {
          setWorkers(response.data);
        } else {
          setError({
            status: 400,
            message: response.message || "Failed to load workers",
          });
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, [organizationId]);

  const filteredWorkers = workers.filter((w) =>
    `${w.firstName} ${w.lastName || ""}`.toLowerCase().includes(query.toLowerCase()) ||
    w.email?.toLowerCase().includes(query.toLowerCase())
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
          <p className="text-sm font-medium text-orange-600">Workforce management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Workers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage worker profiles, assignments, attendance, and performance.</p>
        </div>
        <Link href="/workers/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          Add worker
        </Link>
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading Workers" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredWorkers.length} worker(s) matching "${query}"`
                  : `${workers.length} worker(s) available`}
              </span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredWorkers}
                emptyTitle="No workers available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredWorkers.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching workers found" : "No workers available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredWorkers.map((worker) => (
                    <Link
                      key={worker.id}
                      href={`/workers/${worker.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">
                        {worker.firstName} {worker.lastName || ""}
                      </h3>
                      {worker.email && <p className="mt-1 text-xs text-slate-500">{worker.email}</p>}
                      {worker.phoneNumber && (
                        <p className="mt-1 text-xs text-slate-600">{worker.phoneNumber}</p>
                      )}
                      <p className="mt-2 text-xs font-medium text-slate-500">{worker.status}</p>
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
