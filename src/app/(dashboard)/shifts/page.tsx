"use client";
import { EmptyState } from "@/components/common/states";
export default function ShiftsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Shifts</h1>
        <p className="mt-1 text-sm text-slate-500">Define and manage work shifts, timings, and worker assignments.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No shifts configured" description="Create shift templates to start scheduling workers." />
      </div>
    </>
  );
}
