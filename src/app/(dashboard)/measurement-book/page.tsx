"use client";
import { EmptyState } from "@/components/common/states";
export default function MeasurementBookPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Digital measurement book</h1>
        <p className="mt-1 text-sm text-slate-500">Record chainage, dimensions, quantities, dates, measurers, and approvals.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No measurements yet" description="Automatic quantity preparation, chainage work items, approval workflow" />
      </div>
    </>
  );
}
