"use client";
import { EmptyState } from "@/components/common/states";
export default function ValidationCenterPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Validation center</h1>
        <p className="mt-1 text-sm text-slate-500">Surface missing locations, duplicate phones, missing GST, invalid dates, negative quantities, and missing documents.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No issues found" description="Problem categories, affected record links, admin review queue" />
      </div>
    </>
  );
}
