"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { payrollApi } from "@/lib/api/payroll-api";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { ErrorState } from "@/components/common/states";
import { LineItemsEditor, type LineItem } from "@/components/payroll/line-items-editor";
import { PayrollPreview } from "@/components/payroll/payroll-preview";
import { ALLOWANCE_TYPE_LABELS, DEDUCTION_TYPE_LABELS, startOfMonth, localToday } from "@/lib/payroll-format";
import type { WorkerResponse } from "@/types/worker";
import type { AllowanceType, DeductionType, PayrollAllowance, PayrollDeduction, PayrollRequest, PayrollResponse } from "@/types/payroll";
import type { ApiError } from "@/types/api";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function NewPayrollPage() {
  const router = useRouter();
  const { organizationId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(localToday());
  const [regularHoursPerDay, setRegularHoursPerDay] = useState("8");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [allowances, setAllowances] = useState<LineItem<AllowanceType>[]>([]);
  const [deductions, setDeductions] = useState<LineItem<DeductionType>[]>([]);

  const [preview, setPreview] = useState<PayrollResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!organizationId) return;
    workersApi.list(organizationId).then(setWorkers).catch(() => {});
  }, [organizationId]);

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

  function buildRequest(): PayrollRequest | null {
    if (!workerId) { setError("Select a worker."); return null; }
    if (!startDate || !endDate) { setError("Select a payroll period."); return null; }
    if (endDate < startDate) { setError("Period end date cannot be before the start date."); return null; }
    return {
      workerId,
      startDate,
      endDate,
      regularHoursPerDay: regularHoursPerDay.trim() ? Number(regularHoursPerDay) : undefined,
      overtimeRate: overtimeRate.trim() ? Number(overtimeRate) : undefined,
      allowances: toAllowancePayload(),
      deductions: toDeductionPayload(),
    };
  }

  async function handleCalculate() {
    setError("");
    const request = buildRequest();
    if (!request) return;
    setCalculating(true);
    try {
      const result = await payrollApi.calculate(request);
      setPreview(result);
    } catch (e) {
      setError((e as ApiError).message);
      setPreview(null);
    } finally {
      setCalculating(false);
    }
  }

  async function handleSave() {
    setError("");
    const request = buildRequest();
    if (!request) return;
    setSaving(true);
    try {
      const created = await payrollApi.create(request);
      router.push(`/payroll/${created.id}`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">New payroll</h1>
        <p className="mt-1 text-sm text-slate-500">Calculate a worker&apos;s wages from their attendance, then save the payroll as a draft.</p>
      </div>

      {!organizationId ? (
        <div className="mt-6"><ErrorState message="Select an organization from the top bar first." /></div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-800">Worker &amp; period</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-sm font-medium text-slate-700">
                  Worker
                  <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className={`${INPUT} mt-1`}>
                    <option value="">Select a worker...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.fullName} ({w.employeeId})</option>
                    ))}
                  </select>
                </label>
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
                  <input type="number" min="0" step="0.01" placeholder="Uses worker's configured rate" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} className={`${INPUT} mt-1`} />
                </label>
              </div>
            </section>

            <LineItemsEditor
              title="Allowances"
              items={allowances}
              setItems={setAllowances}
              typeLabels={ALLOWANCE_TYPE_LABELS}
              defaultType="travel"
            />

            <LineItemsEditor
              title="Deductions"
              items={deductions}
              setItems={setDeductions}
              typeLabels={DEDUCTION_TYPE_LABELS}
              defaultType="salary_advance"
            />

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={calculating} onClick={handleCalculate} className="rounded-lg border border-orange-600 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-50">
                {calculating ? "Calculating..." : "Calculate preview"}
              </button>
              <button type="button" disabled={saving || !preview} onClick={handleSave} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save as draft"}
              </button>
              <Link href="/payroll" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
            </div>
          </div>

          <div>
            {preview ? <PayrollPreview preview={preview} /> : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                Calculate a preview to see attendance, earnings and net pay. The backend computes every figure — nothing here is calculated on the frontend.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
