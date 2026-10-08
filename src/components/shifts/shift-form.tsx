"use client";

import { useState } from "react";
import { previewWorkingMinutes, formatWorkingMinutes } from "@/lib/shift-format";
import type { ShiftResponse, ShiftStatus } from "@/types/shift";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export interface ShiftFormValues {
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDurationMinutes: string;
  description: string;
  status: ShiftStatus;
}

function toFormValues(shift?: ShiftResponse | null): ShiftFormValues {
  return {
    shiftCode: shift?.shiftCode ?? "",
    shiftName: shift?.shiftName ?? "",
    startTime: shift?.startTime?.slice(0, 5) ?? "",
    endTime: shift?.endTime?.slice(0, 5) ?? "",
    breakDurationMinutes: shift ? String(shift.breakDurationMinutes) : "0",
    description: shift?.description ?? "",
    status: shift?.status ?? "active",
  };
}

/**
 * Shared Shift Name / Shift Code / Start Time / End Time / Break Duration / Description / Status
 * form used by both the create and edit shift pages, with a live client-side working-hours
 * preview. The backend recomputes and persists the authoritative totalWorkingMinutes on save;
 * this preview is never submitted to the API.
 */
export function ShiftForm({
  initial,
  submitting,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: ShiftResponse | null;
  submitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: ShiftFormValues) => void;
}) {
  const [values, setValues] = useState<ShiftFormValues>(() => toFormValues(initial));

  function set<K extends keyof ShiftFormValues>(key: K, value: ShiftFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const preview = previewWorkingMinutes(values.startTime, values.endTime, Number(values.breakDurationMinutes || 0));
  const overnight = Boolean(values.startTime && values.endTime && values.endTime < values.startTime);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-6"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Shift details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Shift name
            <input required value={values.shiftName} onChange={(e) => set("shiftName", e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Shift code
            <input required value={values.shiftCode} onChange={(e) => set("shiftCode", e.target.value.toUpperCase())} className={`${INPUT} mt-1`} placeholder="e.g. SHIFT-A" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Start time
            <input required type="time" value={values.startTime} onChange={(e) => set("startTime", e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            End time
            <input required type="time" value={values.endTime} onChange={(e) => set("endTime", e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Break duration (minutes)
            <input required type="number" min="0" step="1" value={values.breakDurationMinutes} onChange={(e) => set("breakDurationMinutes", e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Status
            <select value={values.status} onChange={(e) => set("status", e.target.value as ShiftStatus)} className={`${INPUT} mt-1`}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">
            Description
            <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${INPUT} mt-1`} placeholder="Optional notes about this shift" />
          </label>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Working hours preview: </span>
          {preview === null ? "Set a start and end time" : formatWorkingMinutes(preview)}
          {overnight && <span className="ml-2 text-xs font-medium text-orange-600">Crosses midnight</span>}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
