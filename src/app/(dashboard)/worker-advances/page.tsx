"use client";
import { EmptyState } from "@/components/common/states";
export default function WorkerAdvancesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Worker advances</h1>
        <p className="mt-1 text-sm text-slate-500">Track advances, recovery amounts, remaining balances, and payment status.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No advances yet" description="Worker and date records, recovery tracking, outstanding advances" />
      </div>
    </>
  );
}
