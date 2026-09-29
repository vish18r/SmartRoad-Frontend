"use client";
import { EmptyState } from "@/components/common/states";
export default function WorkQueuePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">My work queue</h1>
        <p className="mt-1 text-sm text-slate-500">Prioritize work assigned to the current user across pending, due today, overdue, and completed states.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No work items" description="Priority sorting, due today and overdue, personal assignment scope" />
      </div>
    </>
  );
}
