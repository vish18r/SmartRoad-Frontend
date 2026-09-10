"use client";

import { useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard-api";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import { PRODUCT_NAME } from "@/constants/branding";
import type { SiteDashboardResponse } from "@/types/site-dashboard";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

// Lengths are stored in metres; switch to kilometres once metres stop being
// readable at a glance.
function formatLength(metres: number) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${metres.toFixed(0)} m`;
}

export default function SiteDashboardPage() {
  const { projectId } = useWorkspace();
  const [date, setDate] = useState(todayIso());

  const { data, loading, error } = useApi<SiteDashboardResponse>(
    () => dashboardApi.getSiteDashboard(projectId as string, date),
    { skip: !projectId }
  );

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{PRODUCT_NAME}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Site dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          A supervisor view of today&apos;s work, attendance, materials, and photos.
        </p>
      </div>
      <label className="text-xs font-semibold text-slate-600">
        <span className="mb-1 block">Date</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
        />
      </label>
    </div>
  );

  if (!projectId) {
    return (
      <div>
        {header}
        <div className="mt-7">
          <EmptyState
            title="No site selected"
            description="Pick a project from the workspace selector in the header to see its site dashboard."
          />
        </div>
      </div>
    );
  }

  if (loading) return <div>{header}<div className="mt-7"><Loading /></div></div>;
  if (error) return <div>{header}<div className="mt-7"><ErrorState message={error.message} /></div></div>;
  if (!data) {
    return (
      <div>
        {header}
        <div className="mt-7">
          <EmptyState title="No site dashboard data yet" description="Nothing has been recorded for this site on this date." />
        </div>
      </div>
    );
  }

  const { work, workforce, materials, photos } = data;

  return (
    <div>
      {header}

      <p className="mt-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{data.projectName}</span>
        {data.projectCode && <span className="text-slate-500"> · {data.projectCode}</span>}
      </p>

      <Section title="Today's work and completion">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Completion" value={`${work.completionPercentage}%`} hint={`${work.projectStatus} · ${work.projectProgress}% reported`} />
          <Stat label="Built" value={formatLength(work.completedLengthM)} hint={`of ${formatLength(work.totalLengthM)} planned`} />
          <Stat label="Remaining" value={formatLength(work.remainingLengthM)} />
          <Stat label="Roads" value={`${work.completedRoads}/${work.totalRoads}`} hint="completed / total" />
        </div>
      </Section>

      <Section title="Workers and attendance">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Posted to site" value={String(workforce.assignedWorkers)} hint={`${workforce.marked} marked today`} />
          <Stat label="Present" value={String(workforce.present)} hint={`${workforce.halfDay} half day · ${workforce.absent} absent · ${workforce.onLeave} leave`} />
          <Stat label="Checked in" value={String(workforce.checkedIn)} hint={`${workforce.stillOnSite} still on site`} />
          <Stat label="Hours worked" value={String(workforce.hoursWorked)} />
        </div>
      </Section>

      <Section title="Materials on site">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Tracked materials" value={String(materials.trackedMaterials)} />
          <Stat label="Low stock" value={String(materials.lowStockMaterials)} hint="at or below reorder level" />
          <Stat label="Stock value" value={`₹${materials.stockValue}`} />
        </div>
      </Section>

      <Section title="Site photos">
        {photos.photosToday === 0 ? (
          <EmptyState title="No photos for this date" description="Photos uploaded against this site will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.recent.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.photoUrl} alt={photo.description || photo.photoType} className="h-36 w-full object-cover" />
                <figcaption className="p-3">
                  <p className="text-xs font-semibold text-slate-800">{photo.photoType}</p>
                  {photo.workArea && <p className="text-xs text-slate-500">{photo.workArea}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
