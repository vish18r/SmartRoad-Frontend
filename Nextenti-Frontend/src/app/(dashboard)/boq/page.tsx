"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { boqApi, projectApi } from "@/lib/api";
import type { BoqResponse } from "@/types/boq";
import type { ProjectResponse } from "@/types/project";
import type { ApiError } from "@/types/api";

interface BoqRow extends BoqResponse {
  projectName?: string;
}

const columns: Array<TableColumn<BoqRow>> = [
  { key: "project", label: "Project", render: (row) => row.projectName || "—" },
  { key: "name", label: "BOQ Name", render: (row) => row.name },
  { key: "description", label: "Description", render: (row) => row.description || "—" },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/boq/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function BoqPage() {
  const [query, setQuery] = useState("");
  const [boqs, setBoqs] = useState<BoqRow[]>([]);
  const [projects, setProjects] = useState<Map<string, string>>(new Map());
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

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch projects first
        const projectsResponse = await projectApi.list(organizationId);
        if (projectsResponse.success && projectsResponse.data) {
          const projectMap = new Map<string, string>();
          projectsResponse.data.forEach((p: ProjectResponse) => {
            projectMap.set(p.id, p.name);
          });
          setProjects(projectMap);

          // Then fetch all BOQs for each project
          const allBoqs: BoqRow[] = [];
          for (const project of projectsResponse.data) {
            try {
              const boqResponse = await boqApi.listByProject(project.id);
              if (boqResponse.success && boqResponse.data) {
                boqResponse.data.forEach((b: BoqResponse) => {
                  allBoqs.push({
                    ...b,
                    projectName: project.name,
                  });
                });
              }
            } catch (_err) {
              // Continue loading other projects if one fails
            }
          }
          setBoqs(allBoqs);
        } else {
          setError({
            status: 400,
            message: projectsResponse.message || "Failed to load data",
          });
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const filteredBoqs = boqs.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.projectName?.toLowerCase().includes(query.toLowerCase())
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
          <p className="text-sm font-medium text-orange-600">Bill of Quantities</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">BOQ Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage bill of quantities, items, rates, and estimates.</p>
        </div>
        <Link href="/boq/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          New BOQ
        </Link>
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading BOQs" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredBoqs.length} BOQ(s) matching "${query}"`
                  : `${boqs.length} BOQ(s) available`}
              </span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredBoqs}
                emptyTitle="No BOQs available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredBoqs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching BOQs found" : "No BOQs available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredBoqs.map((boq) => (
                    <Link
                      key={boq.id}
                      href={`/boq/${boq.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">{boq.name}</h3>
                      {boq.projectName && <p className="mt-1 text-xs text-slate-500">{boq.projectName}</p>}
                      {boq.description && (
                        <p className="mt-1 text-xs text-slate-600">{boq.description}</p>
                      )}
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
