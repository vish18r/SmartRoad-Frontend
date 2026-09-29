"use client";
import { EmptyState } from "@/components/common/states";
export default function ResourcePlanningPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Resource planning</h1>
        <p className="mt-1 text-sm text-slate-500">Plan workers, machines, materials, and vehicles by project and date.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No resource plans" description="Daily resource plan, project assignments, conflict detection" />
      </div>
    </>
  );
}
