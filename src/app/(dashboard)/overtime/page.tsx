"use client";
import { EmptyState } from "@/components/common/states";
export default function OvertimePage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Overtime</h1>
        <p className="mt-1 text-sm text-slate-500">Track overtime hours logged by workers across projects and sites.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No overtime records" description="Overtime entries will appear once workers log extra hours." />
      </div>
    </>
  );
}
