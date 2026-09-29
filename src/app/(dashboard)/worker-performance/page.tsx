"use client";
import { EmptyState } from "@/components/common/states";
export default function WorkerPerformancePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Worker performance</h1>
        <p className="mt-1 text-sm text-slate-500">Review attendance, productivity, overtime, payments, and assigned projects with role-aware visibility.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No performance data" description="Configurable performance metrics, productivity and attendance, sensitive rankings restricted by role" />
      </div>
    </>
  );
}
