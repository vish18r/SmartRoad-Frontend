"use client";
import { EmptyState } from "@/components/common/states";
export default function CashFlowPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Cash flow</h1>
        <p className="mt-1 text-sm text-slate-500">Track money received, money paid, pending receivables, pending payables, and net cash flow.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No cash flow data" description="Monthly cash-flow chart, receivables and payables, net cash flow" />
      </div>
    </>
  );
}
