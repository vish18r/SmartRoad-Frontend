"use client";
import { EmptyState } from "@/components/common/states";
export default function TripsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Trips</h1>
        <p className="mt-1 text-sm text-slate-500">Track transport sources, destinations, materials, distance, fuel, and cost.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No trips yet" description="Trip records, project transport cost, vehicle and driver filters" />
      </div>
    </>
  );
}
