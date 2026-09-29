"use client";
import { EmptyState } from "@/components/common/states";
export default function TasksPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Plan project work with assigned users, dates, priorities, statuses, and completion percentage.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No tasks yet" description="Kanban: To do, In progress, Completed, assignee and due date, progress tracking" />
      </div>
    </>
  );
}
