"use client";
import { EmptyState } from "@/components/common/states";
export default function CostForecastPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Cost forecast</h1>
        <p className="mt-1 text-sm text-slate-500">Compare original budget and actual spending with expected final cost and variance.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No forecast data" description="Original and remaining budget, expected final cost, under or over budget forecast" />
      </div>
    </>
  );
}
