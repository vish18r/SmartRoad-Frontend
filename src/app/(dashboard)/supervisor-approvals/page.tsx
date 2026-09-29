"use client";
import { EmptyState } from "@/components/common/states";
export default function SupervisorApprovalsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Supervisor approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare approval queues for daily progress, materials, attendance, machines, and site reports.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No pending approvals" description="Progress and usage approvals, approver and date, audit trail" />
      </div>
    </>
  );
}
