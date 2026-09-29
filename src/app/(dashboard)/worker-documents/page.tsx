"use client";
import { EmptyState } from "@/components/common/states";
export default function WorkerDocumentsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Worker documents</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare ID proof, licenses, certifications, and other worker document expiry tracking.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No documents tracked" description="Expired, expiring soon, valid, worker document categories, expiry reminders" />
      </div>
    </>
  );
}
