"use client";
import { EmptyState } from "@/components/common/states";
export default function RetentionPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Retention and security deposit</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare configurable retention, security deposit, deductions, release dates, and balances.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No retention records" description="Pending retention, release tracking, financial breakdown" />
      </div>
    </>
  );
}
