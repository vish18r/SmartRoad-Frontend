import { formatINR, formatNumber } from "@/lib/currency";
import { DEDUCTION_TYPE_LABELS, ALLOWANCE_TYPE_LABELS } from "@/lib/payroll-format";
import type { PayrollResponse } from "@/types/payroll";

// Shared read-only rendering of a payroll's attendance, earnings, deductions and net pay —
// used by the create/calculate preview and by the payroll details page. Every value here comes
// straight from the backend response; nothing is computed in this component.

export function PayrollPreview({ preview }: { preview: PayrollResponse }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Attendance</h2>
        <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-slate-600 sm:grid-cols-3">
          <Stat label="Present days" value={formatNumber(preview.attendance.presentDays)} />
          <Stat label="Absent days" value={formatNumber(preview.attendance.absentDays)} />
          <Stat label="Paid days" value={formatNumber(preview.attendance.paidDays)} />
          <Stat label="Worked hours" value={formatNumber(preview.attendance.totalWorkedHours)} />
          <Stat label="Regular hours" value={formatNumber(preview.attendance.regularHours)} />
          <Stat label="Overtime hours" value={formatNumber(preview.attendance.overtimeHours)} />
        </dl>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h2 className="text-sm font-semibold text-slate-800">Earnings</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <Row label="Basic wage" value={formatINR(preview.basicWage)} />
          <Row label="Overtime pay" value={formatINR(preview.overtimeAmount)} />
          {preview.allowances.length > 0 && preview.allowances.map((a, i) => (
            <Row key={a.id ?? i} label={`Allowance: ${ALLOWANCE_TYPE_LABELS[a.allowanceType] ?? a.allowanceType}`} value={formatINR(a.amount)} />
          ))}
          <Row label="Total allowances" value={formatINR(preview.totalAllowances)} />
          <Row label="Gross pay" value={formatINR(preview.grossPay)} bold />
        </dl>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h2 className="text-sm font-semibold text-slate-800">Deductions</h2>
        {preview.deductions.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No deductions.</p>
        ) : (
          <dl className="mt-2 space-y-1 text-sm">
            {preview.deductions.map((d, i) => (
              <Row key={d.id ?? i} label={DEDUCTION_TYPE_LABELS[d.deductionType] ?? d.deductionType} value={formatINR(d.amount)} />
            ))}
          </dl>
        )}
        <dl className="mt-2 space-y-1 text-sm">
          <Row label="Total deductions" value={formatINR(preview.totalDeductions)} bold />
        </dl>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <Row label="Net pay" value={formatINR(preview.netPay)} bold large />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function Row({ label, value, bold, large }: { label: string; value: string; bold?: boolean; large?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-slate-900" : "text-slate-600"} ${large ? "text-lg" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
