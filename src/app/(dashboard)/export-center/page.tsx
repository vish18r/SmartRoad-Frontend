"use client";
import { EmptyState } from "@/components/common/states";
export default function ExportCenterPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Backup and export center</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare exports for project, financial, worker, material, and document metadata.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No exports yet" description="Export scope selection, format and date filters, download history" />
      </div>
    </>
  );
}
