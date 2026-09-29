"use client";
import { EmptyState } from "@/components/common/states";
export default function ReceivablesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Receivables</h1>
        <p className="mt-1 text-sm text-slate-500">Track client invoices, due dates, paid amounts, balances, and overdue days.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No receivables yet" description="Client and project filters, overdue alerts, invoice history" />
      </div>
    </>
  );
}
