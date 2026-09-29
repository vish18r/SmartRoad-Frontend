"use client";
import { EmptyState } from "@/components/common/states";
export default function SafetyPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Safety</h1>
        <p className="mt-1 text-sm text-slate-500">Track inspections, PPE compliance, incidents, corrective actions, and accident reports.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No safety records" description="Inspection records, warning and critical indicators, corrective action status" />
      </div>
    </>
  );
}
