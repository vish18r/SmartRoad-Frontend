"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { Loading, ErrorState } from "@/components/common/states";
import { roadsApi, projectApi } from "@/lib/api";
import type { RoadSectionResponse } from "@/types/road";
import type { ProjectResponse } from "@/types/project";
import type { ApiError } from "@/types/api";

interface SectionRow extends RoadSectionResponse {
  roadName?: string;
  projectName?: string;
}

const columns: Array<TableColumn<SectionRow>> = [
  { key: "project", label: "Project", render: (row) => row.projectName || "—" },
  { key: "road", label: "Road", render: (row) => row.roadName || "—" },
  { key: "chainage", label: "Chainage", render: (row) => `${row.startChainage || "—"} to ${row.endChainage || "—"}` },
  { key: "length", label: "Length (m)", render: (row) => row.lengthM.toFixed(2) },
  { key: "progress", label: "Progress", render: (row) => `${Math.round(row.completionPercentage || 0)}%` },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <Link href={`/sections/${row.id}`} className="font-semibold text-orange-600">
        View
      </Link>
    ),
  },
];

export default function SectionsPage() {
  const [query, setQuery] = useState("");
  const [sections, setSections] = useState<SectionRow[]>([]);
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
          const allSections: SectionRow[] = [];

          // Fetch roads for each project
          for (const project of projectsResponse.data) {
            try {
              const roadsResponse = await roadsApi.listByProject(project.id);
              if (roadsResponse.success && roadsResponse.data) {
                // Fetch sections for each road
                for (const road of roadsResponse.data) {
                  try {
                    const sectionsResponse = await roadsApi.listSections(road.id);
                    if (sectionsResponse.success && sectionsResponse.data) {
                      sectionsResponse.data.forEach((s: RoadSectionResponse) => {
                        allSections.push({
                          ...s,
                          roadName: road.name,
                          projectName: project.name,
                        });
                      });
                    }
                  } catch (_err) {
                    // Continue if one road fails
                  }
                }
              }
            } catch (_err) {
              // Continue if one project fails
            }
          }

          setSections(allSections);
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

  const filteredSections = sections.filter(
    (s) =>
      s.roadName?.toLowerCase().includes(query.toLowerCase()) ||
      s.projectName?.toLowerCase().includes(query.toLowerCase())
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
          <p className="text-sm font-medium text-orange-600">Road sections</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Road Sections</h1>
          <p className="mt-1 text-sm text-slate-500">Manage road sections, progress, and completion status.</p>
        </div>
      </div>

      <div className="mt-7">
        <FilterBar onSearch={setQuery} />

        {isLoading && <Loading />}
        {error && <ErrorState title="Error Loading Sections" message={error.message} />}

        {!isLoading && !error && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {query
                  ? `Showing ${filteredSections.length} section(s) matching "${query}"`
                  : `${sections.length} section(s) available`}
              </span>
            </div>

            <div className="mt-3 hidden md:block">
              <DataTable
                columns={columns}
                rows={filteredSections}
                emptyTitle="No sections available"
              />
            </div>

            <div className="mt-3 md:hidden">
              {filteredSections.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  {query ? "No matching sections found" : "No sections available"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredSections.map((section) => (
                    <Link
                      key={section.id}
                      href={`/sections/${section.id}`}
                      className="block rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <h3 className="font-semibold text-slate-900">{section.roadName}</h3>
                      <p className="mt-1 text-xs text-slate-500">{section.projectName}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Chainage: {section.startChainage} to {section.endChainage}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {Math.round(section.completionPercentage || 0)}% complete
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
