"use client";

import type { ReactNode } from "react";
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_PRIORITY_STYLES,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_STYLES,
} from "@/lib/maintenance-format";
import type { MaintenancePriority, MaintenanceStatus } from "@/types/maintenance";

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]";

export function StatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${MAINTENANCE_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {MAINTENANCE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${MAINTENANCE_PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-600"}`}>
      {MAINTENANCE_PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "danger" | "warning" }) {
  const valueColor = tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-700" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, required, children, hint, className = "" }: { label: string; required?: boolean; children: ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
