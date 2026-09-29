"use client";
import { EmptyState } from "@/components/common/states";
export default function RoadCuttingPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Road cutting</h1>
        <p className="mt-1 text-sm text-slate-500">Track cutting quantities, machinery, operators, labour, photos, and remaining work.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No road cutting records" description="Records will appear once road cutting work begins on your projects." />
      </div>
    </>
  );
}
