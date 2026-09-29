"use client";
import { EmptyState } from "@/components/common/states";
export default function ImportCenterPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Data import</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare safe CSV and Excel imports with preview, validation errors, explicit confirmation, and success summaries.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No imports yet" description="Workers, materials, projects, suppliers, expenses, preview and validation, explicit import confirmation" />
      </div>
    </>
  );
}
