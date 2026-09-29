"use client";
import { EmptyState } from "@/components/common/states";
export default function InsightsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Insights</h1>
        <p className="mt-1 text-sm text-slate-500">An AI-ready surface for project risk, unusual costs, wastage, fuel use, absenteeism, and downtime.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No insights yet" description="Projects at risk, cost and usage anomalies, AI provider integration coming soon" />
      </div>
    </>
  );
}
