"use client";
import { EmptyState } from "@/components/common/states";
export default function SubcontractorsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Subcontractors</h1>
        <p className="mt-1 text-sm text-slate-500">Track assigned work, contract amounts, dates, payments, performance, and documents.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No subcontractors yet" description="Work and contract details, payment and performance, document tracking" />
      </div>
    </>
  );
}
