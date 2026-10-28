"use client";

import { useState } from "react";
import { maintenanceApi } from "@/lib/api/maintenance-api";
import { useToast } from "@/hooks/useToast";
import { Field, Modal, inputClass } from "@/components/maintenance/maintenance-ui";
import { formatDateTime, toDateTimeLocalValue, toOffsetIso } from "@/lib/maintenance-format";
import type { ApiError } from "@/types/api";
import type { MaintenanceRecord } from "@/types/maintenance";

export type MaintenanceAction = "start" | "complete" | "cancel";

const TITLES: Record<MaintenanceAction, string> = {
  start: "Start maintenance",
  complete: "Complete maintenance",
  cancel: "Cancel maintenance",
};

/**
 * Dialog driving one workflow transition (start / complete / cancel) for a maintenance record.
 * The server enforces every transition rule; this dialog only collects the optional inputs.
 */
export function MaintenanceActionDialog({
  record,
  action,
  onClose,
  onDone,
}: {
  record: MaintenanceRecord;
  action: MaintenanceAction;
  onClose: () => void;
  onDone: (updated: MaintenanceRecord) => void;
}) {
  const toast = useToast();
  const [when, setWhen] = useState(toDateTimeLocalValue(new Date()));
  const [actualCost, setActualCost] = useState(record.actualCost != null ? String(record.actualCost) : "");
  const [partsUsed, setPartsUsed] = useState(record.partsUsed ?? "");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError(null);
    if (action === "complete") {
      if (record.actualStart && when && new Date(when) < new Date(record.actualStart)) {
        setError("Actual end cannot be before the actual start.");
        return;
      }
      if (actualCost.trim() !== "" && (Number.isNaN(Number(actualCost)) || Number(actualCost) < 0)) {
        setError("Actual cost must be a number ≥ 0.");
        return;
      }
    }
    setSaving(true);
    try {
      let updated: MaintenanceRecord;
      if (action === "start") {
        updated = await maintenanceApi.start(record.id, { actualStart: toOffsetIso(when), notes: notes.trim() || undefined });
        toast.success(`${record.maintenanceReference} started.`);
      } else if (action === "complete") {
        updated = await maintenanceApi.complete(record.id, {
          actualEnd: toOffsetIso(when),
          actualCost: actualCost.trim() === "" ? undefined : Number(actualCost),
          partsUsed: partsUsed.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success(`${record.maintenanceReference} completed.`);
      } else {
        updated = await maintenanceApi.cancel(record.id, { reason: reason.trim() || undefined });
        toast.success(`${record.maintenanceReference} cancelled.`);
      }
      onDone(updated);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Action failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`${TITLES[action]} — ${record.maintenanceReference}`} onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        <span className="font-medium text-slate-900">{record.title}</span>
        {record.machineName ? ` · ${record.machineName}` : ""}
      </p>

      <div className="space-y-4">
        {action === "start" && (
          <>
            <Field label="Actual start" hint="Defaults to now. Cannot be in the future.">
              <input type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
            <Field label="Note (optional)">
              <textarea rows={2} className={`${inputClass} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </>
        )}

        {action === "complete" && (
          <>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Started {formatDateTime(record.actualStart)}. Downtime is calculated automatically from the actual start and end.</p>
            <Field label="Actual end" hint="Defaults to now.">
              <input type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} />
            </Field>
            <Field label="Actual cost (₹)" hint={record.estimatedCost != null ? `Estimated: ₹${record.estimatedCost}` : undefined}>
              <input type="number" min="0" step="0.01" className={inputClass} value={actualCost} onChange={(e) => setActualCost(e.target.value)} />
            </Field>
            <Field label="Parts used">
              <textarea rows={2} className={`${inputClass} resize-none`} value={partsUsed} onChange={(e) => setPartsUsed(e.target.value)} placeholder="e.g. 2x hydraulic filter, 20 L engine oil" />
            </Field>
            <Field label="Completion note (optional)">
              <textarea rows={2} className={`${inputClass} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </>
        )}

        {action === "cancel" && (
          <Field label="Reason (optional)">
            <textarea rows={3} maxLength={1000} className={`${inputClass} resize-none`} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        )}

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} disabled={saving}>
          Back
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
            action === "cancel" ? "bg-red-600 hover:bg-red-700" : action === "complete" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700"
          }`}
          onClick={submit}
          disabled={saving}
        >
          {saving ? "Saving..." : TITLES[action]}
        </button>
      </div>
    </Modal>
  );
}
