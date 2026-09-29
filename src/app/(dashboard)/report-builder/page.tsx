"use client";
import { EmptyState } from "@/components/common/states";
export default function ReportBuilderPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Report builder</h1>
        <p className="mt-1 text-sm text-slate-500">Choose report type, project, date range, and status before viewing, printing, or exporting.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No reports generated" description="Project, expense, attendance, payroll, material, fuel, machine, daily progress, profit/loss and payment reports" />
      </div>
    </>
  );
}
