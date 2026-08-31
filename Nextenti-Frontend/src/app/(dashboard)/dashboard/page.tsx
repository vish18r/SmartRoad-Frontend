"use client";

import { useEffect, useState } from "react";
import { ErrorState, Loading } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { dashboardApi, projectApi, workersApi, healthApi } from "@/lib/api";
import type { ApiError, HealthStatusResponse, DashboardStats } from "@/types";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import Link from "next/link";

interface DashboardMetrics {
  health: HealthStatusResponse | null;
  projects: number;
  workers: number;
  budget: number;
  stats: DashboardStats | null;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    health: null,
    projects: 0,
    workers: 0,
    budget: 0,
    stats: null,
  });
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

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [healthRes, projectsRes, workersRes, dashboardRes] = await Promise.all([
          healthApi.getStatus(),
          projectApi.list(organizationId),
          workersApi.list(organizationId),
          dashboardApi.getStats(),
        ]);

        const newMetrics: DashboardMetrics = {
          health: healthRes.data || null,
          projects: projectsRes.success && projectsRes.data ? projectsRes.data.length : 0,
          workers: workersRes.success && workersRes.data ? workersRes.data.length : 0,
          budget: dashboardRes.success && dashboardRes.data ? dashboardRes.data.totalBudget || 0 : 0,
          stats: dashboardRes.success && dashboardRes.data ? dashboardRes.data : null,
        };

        setMetrics(newMetrics);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [organizationId]);

  if (!organizationId) {
    return (
      <ErrorState title="Configuration Error" message="Organization ID not found. Please login again." />
    );
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Overview</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Your construction operations workspace.</p>
      </div>

      {isLoading && (
        <section className="mt-7">
          <Loading />
        </section>
      )}

      {error && (
        <section className="mt-7">
          <ErrorState title="Error Loading Dashboard" message={error.message} />
        </section>
      )}

      {!isLoading && !error && (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card
              title="Backend status"
              value={metrics.health?.status || "Unavailable"}
              detail={metrics.health ? "Connected" : undefined}
            />
            <Card
              title="Projects"
              value={String(metrics.projects)}
              detail={metrics.projects > 0 ? "Active" : "No projects"}
            />
            <Card
              title="Workers"
              value={String(metrics.workers)}
              detail={metrics.workers > 0 ? "On roster" : "No workers"}
            />
            <Card
              title="Total Budget"
              value={`₹${(metrics.budget / 100000).toFixed(1)}L`}
              detail={metrics.stats?.totalProjects ? `${metrics.stats.totalProjects} projects` : undefined}
            />
          </section>

          <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Project Overview</h2>
            {metrics.projects > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Total Projects</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.stats?.totalProjects || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Completed Projects</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.stats?.completedProjects || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Total Roads</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.stats?.totalRoads || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Completed Roads</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.stats?.completedRoads || 0}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No project data available. Start by creating your first project.
              </p>
            )}
          </section>

          <section className="mt-7 grid gap-4 sm:grid-cols-2">
            <ChartPlaceholder
              title="Project progress"
              description="Completion by project and road section."
            />
            <ChartPlaceholder
              title="Monthly expenses"
              description="Committed, spent, and remaining budget."
            />
            <ChartPlaceholder
              title="Material and fuel usage"
              description="Consumption trends across sites and machines."
            />
            <ChartPlaceholder
              title="Worker attendance"
              description="Present and absent workforce by day."
            />
          </section>

          <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">Quick access</h2>
              <Link href="/report-builder" className="text-sm font-semibold text-orange-600">
                Build a report
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/site-diary"
                className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300"
              >
                Daily site diary
              </Link>
              <Link
                href="/approvals"
                className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300"
              >
                Pending approvals
              </Link>
              <Link
                href="/documents"
                className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300"
              >
                Project documents
              </Link>
              <Link
                href="/completion"
                className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300"
              >
                Completion checklist
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
