"use client";
import { EmptyState } from "@/components/common/states";
export default function ApprovalsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Review expenses, purchases, transfers, payments, and contracts through a clear approval queue.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No approvals yet" description="Pending, approved, and rejected, approver and approval date, action history" />
      </div>
    </>
  );
}
