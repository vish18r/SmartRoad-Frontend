"use client";
import { EmptyState } from "@/components/common/states";
export default function ActivityStreamPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Global activity stream</h1>
        <p className="mt-1 text-sm text-slate-500">A real-time-style grouped feed for project, payment, material, maintenance, and progress activity.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No activity yet" description="Today, yesterday, earlier, activity categories, live updates" />
      </div>
    </>
  );
}
