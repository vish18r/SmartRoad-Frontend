"use client";
import { EmptyState } from "@/components/common/states";
export default function ClientApprovalsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Client approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare milestone, material, measurement, and final completion approvals for client review.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No client approvals" description="Pending, approved, rejected, changes requested, approval details, client-scoped access" />
      </div>
    </>
  );
}
