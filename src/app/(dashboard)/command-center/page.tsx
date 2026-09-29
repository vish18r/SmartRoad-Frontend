"use client";
import { EmptyState } from "@/components/common/states";
export default function CommandCenterPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Command center</h1>
        <p className="mt-1 text-sm text-slate-500">One operational view for projects, people, equipment, materials, expenses, payments, alerts, and approvals.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No data to display" description="Problem-focused overview, quick navigation, admin-only backend scope coming soon" />
      </div>
    </>
  );
}
