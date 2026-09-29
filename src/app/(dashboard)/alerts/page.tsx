"use client";
import { EmptyState } from "@/components/common/states";
export default function AlertsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Smart Alerts</h1>
        <p className="mt-1 text-sm text-slate-500">Prioritized operational alerts with resolution workflows.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No alerts" description="Priority filters: Critical, High, Medium, Low, resolve and audit alerts, open related project or asset" />
      </div>
    </>
  );
}
