"use client";
import { EmptyState } from "@/components/common/states";
export default function BudgetPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Budget control</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor budget, committed cost, spent cost, remaining amount, and project health.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No budget data" description="Project-wise breakdown, within limit, near limit, and over budget, committed versus spent" />
      </div>
    </>
  );
}
