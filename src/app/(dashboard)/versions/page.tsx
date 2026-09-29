"use client";
import { EmptyState } from "@/components/common/states";
export default function VersionsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Version history</h1>
        <p className="mt-1 text-sm text-slate-500">Compare previous versions of important records such as project budgets.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No version history" description="Version list, previous and new values, compare changes" />
      </div>
    </>
  );
}
