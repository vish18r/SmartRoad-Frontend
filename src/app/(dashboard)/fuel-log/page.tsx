"use client";
import { EmptyState } from "@/components/common/states";
export default function FuelLogPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Fuel log</h1>
        <p className="mt-1 text-sm text-slate-500">Record machine and vehicle fuel usage, readings, suppliers, and invoices.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No fuel logs yet" description="Fuel type and quantity, meter or hour reading, supplier and invoice details" />
      </div>
    </>
  );
}
