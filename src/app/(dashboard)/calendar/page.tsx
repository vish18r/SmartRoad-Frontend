"use client";
import { EmptyState } from "@/components/common/states";
export default function CalendarPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">Project milestones, maintenance, payments, and tasks in one view.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No calendar events" description="Month, week, and day views, project and maintenance events, event detail panel" />
      </div>
    </>
  );
}
