"use client";
import { EmptyState } from "@/components/common/states";
export default function MaterialWastagePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Material wastage</h1>
        <p className="mt-1 text-sm text-slate-500">Compare expected, used, and wasted quantity with configurable warning thresholds.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No wastage records" description="Wastage percentage, project and material filters, threshold warnings" />
      </div>
    </>
  );
}
