"use client";
import { EmptyState } from "@/components/common/states";
export default function TaxPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Tax and GST breakdown</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare configurable invoice and payment calculations without hardcoding tax rates.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No tax records" description="Subtotal and GST, other tax and deductions, configurable net payable" />
      </div>
    </>
  );
}
