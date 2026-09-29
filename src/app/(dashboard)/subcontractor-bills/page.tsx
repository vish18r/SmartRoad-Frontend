"use client";
import { EmptyState } from "@/components/common/states";
export default function SubcontractorBillsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Subcontractor billing</h1>
        <p className="mt-1 text-sm text-slate-500">Track bill quantities, rates, gross amounts, deductions, paid amounts, and balances.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No bills yet" description="Bill history, deductions, payment balance" />
      </div>
    </>
  );
}
