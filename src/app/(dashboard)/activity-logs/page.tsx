"use client";
import { EmptyState } from "@/components/common/states";
export default function ActivityLogsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Activity logs</h1>
        <p className="mt-1 text-sm text-slate-500">A searchable audit trail for actions across the workspace.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No activity yet" description="Search and module filters, user and date-range filters, pagination and export" />
      </div>
    </>
  );
}
