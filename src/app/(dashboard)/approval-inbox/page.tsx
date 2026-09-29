"use client";
import { EmptyState } from "@/components/common/states";
export default function ApprovalInboxPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Approval inbox</h1>
        <p className="mt-1 text-sm text-slate-500">One queue for expenses, purchases, payments, transfers, progress, measurements, and documents.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No pending approvals" description="Pending approval categories, approve, reject, view details, approval audit trail" />
      </div>
    </>
  );
}
