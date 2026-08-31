"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { ProjectContractNotice } from "@/components/projects/project-contract-notice";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { projectApi } from "@/lib/api";
import type { ProjectResponse } from "@/types/project";
import type { ApiError } from "@/types/api";

interface ProjectRow extends ProjectResponse {}

const columns: Array<TableColumn<ProjectRow>> = [
  { key: "project", label: "Project", render: (row) => row.name },
  { key: "code", label: "Code", render: (row) => row.code || "—" },
  { key: "status", label: "Status", render: (row) => row.status || "—" },
  { key: "progress", label: "Progress", render: (row) => `${Math.round(row.progress || 0)}%` },
  { key: "budget", label: "Budget", render: (row) => `₹${(row.budget || 0).toLocaleString()}` },
  { key: "cost", label: "Actual Cost", render: (row) => `₹${(row.actualCost || 0).toLocaleString()}` },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/projects/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Get organization ID from localStorage (should be set during authentication)
    const storedOrgId = localStorage.getItem("organizationId");
    if (storedOrgId) {
      setOrganizationId(storedOrgId);
    }
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await projectApi.list(organizationId);
        if (response.success && response.data) {
          setProjects(response.data);
        } else {
          setError({
            status: 400,
            message: response.message || "Failed to load projects",
          });
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [organizationId]);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code?.toLowerCase().includes(query.toLowerCase())
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
          <p className="text-sm font-medium text-orange-600">Project control</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Projects and CC roads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, filter, and manage road construction projects.
          </p>
        </div>
        <Link href="/projects/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          New project
        </Link>
      </div>

      <div className="mt-7">
        <ProjectContractNotice />
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading Projects" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredProjects.length} project(s) matching "${query}"`
                  : `${projects.length} project(s) available`}
              </span>
              <span>Page 1</span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredProjects}
                emptyTitle="No projects available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredProjects.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching projects found" : "No projects available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">{project.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{project.code}</p>
                      <p className="mt-1 text-xs text-slate-600">{Math.round(project.progress || 0)}% complete</p>
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
