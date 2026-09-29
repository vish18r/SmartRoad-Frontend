"use client";
import { EmptyState } from "@/components/common/states";
export default function IssuesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project issues</h1>
        <p className="mt-1 text-sm text-slate-500">Report, assign, prioritize, and resolve project problems with an auditable history.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No issues reported" description="Priority and category filters, assignment and due dates, open, progress, resolved, and closed statuses" />
      </div>
    </>
  );
}
