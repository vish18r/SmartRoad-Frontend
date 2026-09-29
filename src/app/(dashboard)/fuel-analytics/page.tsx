"use client";
import { EmptyState } from "@/components/common/states";
export default function FuelAnalyticsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Fuel analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Understand fuel consumption and cost by machine, project, and month.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No fuel data" description="Date, project, and machine filters, consumption and cost charts, machine and project breakdown tables" />
      </div>
    </>
  );
}
