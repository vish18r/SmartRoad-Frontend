"use client";
import { EmptyState } from "@/components/common/states";
export default function ExecutivePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Executive dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A management view of contract value, cost, revenue, profit, receivables, payables, projects, and completion rate.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No executive data" description="Contract and project health, profit and margin, outstanding cash position" />
      </div>
    </>
  );
}
