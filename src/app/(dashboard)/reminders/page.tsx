"use client";
import { EmptyState } from "@/components/common/states";
export default function RemindersPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Reminders</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare reminders for contracts, deadlines, maintenance, payments, and expiring documents.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No reminders set" description="Date and time, repeat and priority, reminder categories" />
      </div>
    </>
  );
}
