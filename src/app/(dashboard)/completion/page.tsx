"use client";
import { EmptyState } from "@/components/common/states";
export default function CompletionPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project completion</h1>
        <p className="mt-1 text-sm text-slate-500">Verify work, materials, machines, payments, documents, measurements, and final billing before completion.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No completion records" description="Completion checklist, final measurement, mark project completed" />
      </div>
    </>
  );
}
