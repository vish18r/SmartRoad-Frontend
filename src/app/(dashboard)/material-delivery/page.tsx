"use client";
import { EmptyState } from "@/components/common/states";
export default function MaterialDeliveryPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Material delivery verification</h1>
        <p className="mt-1 text-sm text-slate-500">Compare ordered, received, and damaged quantities with supplier, vehicle, invoice, photos, and receiver signature.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No deliveries yet" description="Quantity variance, invoice and delivery date, receiver signature and photos" />
      </div>
    </>
  );
}
