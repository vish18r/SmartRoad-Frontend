"use client";
import { EmptyState } from "@/components/common/states";
export default function PayablesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Payables</h1>
        <p className="mt-1 text-sm text-slate-500">Track amounts owed to suppliers, workers, machine owners, and transport vendors.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No payables yet" description="Total, paid, outstanding, overdue, vendor type filters, payment history" />
      </div>
    </>
  );
}
