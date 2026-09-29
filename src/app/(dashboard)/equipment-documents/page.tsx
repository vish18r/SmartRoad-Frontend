"use client";
import { EmptyState } from "@/components/common/states";
export default function EquipmentDocumentsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Equipment document expiry</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor insurance, registration, fitness, permits, and pollution certificates.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No documents tracked" description="Expired and expiring soon, machine and vehicle documents, expiry reminders" />
      </div>
    </>
  );
}
