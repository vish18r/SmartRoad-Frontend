"use client";
import { EmptyState } from "@/components/common/states";
export default function ProjectHealthPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project health</h1>
        <p className="mt-1 text-sm text-slate-500">Assess schedule, budget, materials, labour, machines, and payments with explainable health reasons.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No health data" description="Healthy, at risk, and critical, dimension-level indicators, reasons behind every score" />
      </div>
    </>
  );
}
