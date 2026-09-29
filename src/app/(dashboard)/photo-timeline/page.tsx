"use client";
import { EmptyState } from "@/components/common/states";
export default function PhotoTimelinePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Site photo timeline</h1>
        <p className="mt-1 text-sm text-slate-500">Arrange project photos chronologically and filter them by date or work category.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No photos yet" description="Chronological timeline, date and category filters, geo-tag metadata preparation" />
      </div>
    </>
  );
}
