"use client";
import { EmptyState } from "@/components/common/states";
export default function MachinesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Machines</h1>
        <p className="mt-1 text-sm text-slate-500">Track machinery assignments, usage hours, fuel consumption, and maintenance schedules.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No machines registered" description="Add machines to track utilisation and maintenance." />
      </div>
    </>
  );
}
