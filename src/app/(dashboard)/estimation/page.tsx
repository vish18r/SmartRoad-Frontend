"use client";
import { EmptyState } from "@/components/common/states";
export default function EstimationPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project estimation</h1>
        <p className="mt-1 text-sm text-slate-500">Plan labour, material, machine, fuel, transport, and other costs.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No estimates yet" description="Estimated project cost, expected profit and margin, estimated versus actual comparison" />
      </div>
    </>
  );
}
