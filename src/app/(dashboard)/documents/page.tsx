"use client";
import { EmptyState } from "@/components/common/states";
export default function DocumentsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Keep contracts, work orders, invoices, bills, and receipts close to the work.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No documents yet" description="Upload and preview, filter by project, download and delete" />
      </div>
    </>
  );
}
