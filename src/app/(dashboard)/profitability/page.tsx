"use client";
import { EmptyState } from "@/components/common/states";
export default function ProfitabilityPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Profit and loss</h1>
        <p className="mt-1 text-sm text-slate-500">Review contract value, project cost, revenue, profit, and margin by project.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No profitability data" description="Project profitability, estimated versus actual, profit margin" />
      </div>
    </>
  );
}
