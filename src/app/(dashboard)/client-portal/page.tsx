"use client";
import { EmptyState } from "@/components/common/states";
export default function ClientPortalPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Client portal</h1>
        <p className="mt-1 text-sm text-slate-500">A restricted client view of their projects, progress, documents, bills, issues, and completion status.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No client projects" description="Client-only project scope, milestones and approvals, bills and payment status" />
      </div>
    </>
  );
}
