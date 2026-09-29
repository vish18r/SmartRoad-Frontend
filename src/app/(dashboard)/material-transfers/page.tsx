"use client";
import { EmptyState } from "@/components/common/states";
export default function MaterialTransfersPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Material transfers</h1>
        <p className="mt-1 text-sm text-slate-500">Move material between project sites with approval and receipt tracking.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No transfers yet" description="Source and destination projects, quantity and transfer date, approval and receipt details" />
      </div>
    </>
  );
}
