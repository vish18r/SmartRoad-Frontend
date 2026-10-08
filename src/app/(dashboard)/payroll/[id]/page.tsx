"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { payrollApi } from "@/lib/api/payroll-api";
import { Loading, ErrorState } from "@/components/common/states";
import { LineItemsEditor, type LineItem } from "@/components/payroll/line-items-editor";
import { PayrollPreview } from "@/components/payroll/payroll-preview";
import {
  PAYROLL_STATUS_LABELS,
  PAYROLL_STATUS_STYLES,
  WAGE_TYPE_LABELS,
  ALLOWANCE_TYPE_LABELS,
  DEDUCTION_TYPE_LABELS,
  formatDate,
  formatDateTime,
} from "@/lib/payroll-format";
import { formatINR } from "@/lib/currency";
import type { AllowanceType, DeductionType, PayrollAllowance, PayrollDeduction, PayrollRequest, PayrollResponse } from "@/types/payroll";
import type { ApiError } from "@/types/api";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function PayrollDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [payroll, setPayroll] = useState<PayrollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    payrollApi.getById(id)
      .then(setPayroll)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function runAction(action: (id: string) => Promise<PayrollResponse>) {
    setActionBusy(true);
    setActionError("");
    try {
      const updated = await action(id);
      setPayroll(updated);
    } catch (e) {
      setActionError((e as ApiError).message);
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !payroll) return <ErrorState message={error || "Payroll not found."} />;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/payroll" className="text-xs font-medium text-orange-600 hover:underline">← Back to payroll</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Payroll — {payroll.employeeId}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(payroll.payrollStartDate)} – {formatDate(payroll.payrollEndDate)}</p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${PAYROLL_STATUS_STYLES[payroll.status ?? ""] ?? "bg-slate-100 text-slate-600"}`}>
          {PAYROLL_STATUS_LABELS[payroll.status ?? ""] ?? payroll.status}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Worker</h2>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <Info label="Employee ID" value={payroll.employeeId} />
              <Info label="Name" value={payroll.workerName ?? "—"} />
              <Info label="Mobile" value={payroll.mobileNumber ?? "—"} />
              <Info label="Site" value={payroll.siteName ?? "—"} />
              <Info label="Wage type" value={WAGE_TYPE_LABELS[payroll.wageType] ?? payroll.wageType} />
              <Info label="Wage rate" value={payroll.wageType === "monthly" ? formatINR(payroll.monthlyWage) + "/mo" : formatINR(payroll.dailyWage) + "/day"} />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Status timeline</h2>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <Info label="Processed" value={formatDateTime(payroll.processedAt)} />
              <Info label="Approved" value={formatDateTime(payroll.approvedAt)} />
              <Info label="Paid" value={formatDateTime(payroll.paidAt)} />
            </dl>
          </section>

          {actionError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {payroll.status === "draft" && (
                <button type="button" disabled={actionBusy} onClick={() => runAction(payrollApi.process)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  Process
                </button>
              )}
              {payroll.status === "processed" && (
                <button type="button" disabled={actionBusy} onClick={() => runAction(payrollApi.approve)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  Approve
                </button>
              )}
              {payroll.status === "approved" && (
                <button type="button" disabled={actionBusy} onClick={() => runAction(payrollApi.markPaid)} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                  Mark paid
                </button>
              )}
              {payroll.status !== "paid" && payroll.status !== "cancelled" && (
                <button type="button" disabled={actionBusy} onClick={() => runAction(payrollApi.cancel)} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  Cancel
                </button>
              )}
              {(payroll.status === "paid" || payroll.status === "cancelled") && (
                <p className="text-sm text-slate-400">This payroll is finalized; no further actions are available.</p>
              )}
            </div>
          </section>

          {payroll.status === "draft" && <EditPayrollForm payroll={payroll} onSaved={setPayroll} />}
        </div>

        <div>
          <PayrollPreview preview={payroll} />
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function EditPayrollForm({ payroll, onSaved }: { payroll: PayrollResponse; onSaved: (p: PayrollResponse) => void }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(payroll.payrollStartDate);
  const [endDate, setEndDate] = useState(payroll.payrollEndDate);
  const [regularHoursPerDay, setRegularHoursPerDay] = useState(String(payroll.regularHoursPerDay ?? 8));
  const [overtimeRate, setOvertimeRate] = useState(String(payroll.overtimeRate ?? ""));
  const [allowances, setAllowances] = useState<LineItem<AllowanceType>[]>(
    payroll.allowances.map((a, i) => ({ key: a.id ?? `a-${i}`, type: a.allowanceType, description: a.description ?? "", amount: String(a.amount) }))
  );
  const [deductions, setDeductions] = useState<LineItem<DeductionType>[]>(
    payroll.deductions.map((d, i) => ({ key: d.id ?? `d-${i}`, type: d.deductionType, description: d.description ?? "", amount: String(d.amount) }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toAllowancePayload(): PayrollAllowance[] {
    return allowances
      .filter((line) => line.amount.trim() !== "")
      .map((line) => ({ allowanceType: line.type, description: line.description || undefined, amount: Number(line.amount) }));
  }

  function toDeductionPayload(): PayrollDeduction[] {
    return deductions
      .filter((line) => line.amount.trim() !== "")
      .map((line) => ({ deductionType: line.type, description: line.description || undefined, amount: Number(line.amount) }));
  }

  async function handleSave() {
    setError("");
    if (!startDate || !endDate) { setError("Select a payroll period."); return; }
    if (endDate < startDate) { setError("Period end date cannot be before the start date."); return; }
    const request: PayrollRequest = {
      workerId: payroll.workerId,
      startDate,
      endDate,
      regularHoursPerDay: regularHoursPerDay.trim() ? Number(regularHoursPerDay) : undefined,
      overtimeRate: overtimeRate.trim() ? Number(overtimeRate) : undefined,
      allowances: toAllowancePayload(),
      deductions: toDeductionPayload(),
    };
    setSaving(true);
    try {
      const updated = await payrollApi.update(payroll.id as string, request);
      onSaved(updated);
      router.refresh();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-800">Edit draft</h2>
      <p className="mt-1 text-xs text-slate-400">Changes are recalculated by the backend when saved.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Period start
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Period end
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Regular hours/day
          <input type="number" min="0.5" step="0.5" value={regularHoursPerDay} onChange={(e) => setRegularHoursPerDay(e.target.value)} className={`${INPUT} mt-1`} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Overtime rate (₹/hr)
          <input type="number" min="0" step="0.01" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} className={`${INPUT} mt-1`} />
        </label>
      </div>

      <div className="mt-4 space-y-4">
        <LineItemsEditor title="Allowances" items={allowances} setItems={setAllowances} typeLabels={ALLOWANCE_TYPE_LABELS} defaultType="travel" />
        <LineItemsEditor title="Deductions" items={deductions} setItems={setDeductions} typeLabels={DEDUCTION_TYPE_LABELS} defaultType="salary_advance" />
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4">
        <button type="button" disabled={saving} onClick={handleSave} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </section>
  );
}
