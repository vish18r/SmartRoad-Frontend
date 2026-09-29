"use client";
import { EmptyState } from "@/components/common/states";
export default function PaymentsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">Track worker, supplier, machine, and other payment obligations.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No payments yet" description="Paid, pending, partial, and overdue statuses, due dates and payment history, filter by payment type and status" />
      </div>
    </>
  );
}
