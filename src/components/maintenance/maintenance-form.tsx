"use client";

import { useState } from "react";
import { machineApi } from "@/lib/api/machine-api";
import { projectApi } from "@/lib/api/project-api";
import { workersApi } from "@/lib/api/workers-api";
import { maintenanceApi } from "@/lib/api/maintenance-api";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Loading } from "@/components/common/states";
import { Field, Modal, inputClass } from "@/components/maintenance/maintenance-ui";
import {
  CATEGORIES_BY_TYPE,
  MAINTENANCE_CATEGORY_LABELS,
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_PRIORITY_OPTIONS,
  MAINTENANCE_RECURRENCE_LABELS,
  toDateTimeLocalValue,
  toOffsetIso,
} from "@/lib/maintenance-format";
import type { ApiError } from "@/types/api";
import type { WorkerResponse } from "@/types/worker";
import type { ProjectResponse } from "@/types/project";
import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceRecord,
  MaintenanceRecurrence,
  MaintenanceRequest,
  MaintenanceType,
} from "@/types/maintenance";

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Builds a full PUT payload from an existing record (used for notes-only edits of terminal records). */
export function recordToRequest(record: MaintenanceRecord): MaintenanceRequest {
  return {
    machineId: record.machineId,
    projectId: record.projectId ?? undefined,
    title: record.title,
    maintenanceType: record.maintenanceType,
    category: record.category,
    description: record.description ?? undefined,
    priority: record.priority,
    scheduledStart: record.scheduledStart,
    scheduledEnd: record.scheduledEnd ?? undefined,
    reportedAt: record.reportedAt ?? undefined,
    technicianWorkerId: record.technicianWorkerId ?? undefined,
    technicianName: record.technicianName ?? undefined,
    estimatedCost: record.estimatedCost ?? undefined,
    actualCost: record.actualCost ?? undefined,
    partsUsed: record.partsUsed ?? undefined,
    notes: record.notes ?? undefined,
    recurrenceType: record.recurrenceType,
  };
}

export function MaintenanceFormDialog({
  organizationId,
  initial,
  defaultProjectId,
  defaultMachineId,
  onClose,
  onSaved,
}: {
  organizationId: string;
  initial?: MaintenanceRecord;
  defaultProjectId?: string | null;
  defaultMachineId?: string | null;
  onClose: () => void;
  onSaved: (record: MaintenanceRecord) => void;
}) {
  const toast = useToast();
  const isEdit = Boolean(initial);

  const { data: machinePage, loading: machinesLoading } = useApi(
    () => machineApi.list({ organizationId, limit: 500 }),
    { skip: !organizationId, deps: [organizationId] }
  );
  const { data: projects } = useApi<ProjectResponse[]>(
    () => projectApi.list(organizationId),
    { skip: !organizationId, deps: [organizationId] }
  );
  const { data: workers } = useApi<WorkerResponse[]>(
    () => workersApi.list(organizationId),
    { skip: !organizationId, deps: [organizationId] }
  );
  const machines = machinePage?.items ?? [];

  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(initial?.maintenanceType ?? "preventive");
  const [machineId, setMachineId] = useState(initial?.machineId ?? defaultMachineId ?? "");
  const [projectId, setProjectId] = useState(initial?.projectId ?? defaultProjectId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<MaintenanceCategory>(initial?.category ?? "scheduled_servicing");
  const [priority, setPriority] = useState<MaintenancePriority>(initial?.priority ?? "medium");
  const [scheduledStart, setScheduledStart] = useState(toDateTimeLocalValue(initial?.scheduledStart));
  const [scheduledEnd, setScheduledEnd] = useState(toDateTimeLocalValue(initial?.scheduledEnd));
  const [reportedAt, setReportedAt] = useState(toDateTimeLocalValue(initial?.reportedAt));
  const [technicianWorkerId, setTechnicianWorkerId] = useState(initial?.technicianWorkerId ?? "");
  const [technicianName, setTechnicianName] = useState(initial?.technicianWorkerId ? "" : initial?.technicianName ?? "");
  const [estimatedCost, setEstimatedCost] = useState(initial?.estimatedCost != null ? String(initial.estimatedCost) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [recurrenceType, setRecurrenceType] = useState<MaintenanceRecurrence>(initial?.recurrenceType ?? "one_time");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function changeType(next: MaintenanceType) {
    setMaintenanceType(next);
    if (!CATEGORIES_BY_TYPE[next].includes(category)) setCategory(CATEGORIES_BY_TYPE[next][0]);
    if (next === "corrective") {
      setRecurrenceType("one_time");
      if (!isEdit) {
        setPriority("high");
        const now = toDateTimeLocalValue(new Date());
        if (!scheduledStart) setScheduledStart(now);
        if (!reportedAt) setReportedAt(now);
      }
    } else if (!isEdit) {
      setPriority("medium");
    }
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!machineId) next.machineId = "Machine is required.";
    if (!title.trim()) next.title = "Title is required.";
    if (!scheduledStart) next.scheduledStart = "Scheduled start is required.";
    if (scheduledStart && scheduledEnd && new Date(scheduledEnd) <= new Date(scheduledStart)) {
      next.scheduledEnd = "Scheduled end must be after the scheduled start.";
    }
    const cost = optionalNumber(estimatedCost);
    if (estimatedCost.trim() !== "" && (cost === undefined || cost < 0)) next.estimatedCost = "Estimated cost must be a number ≥ 0.";
    return next;
  }

  async function handleSubmit() {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const body: MaintenanceRequest = {
      machineId,
      projectId: projectId || undefined,
      title: title.trim(),
      maintenanceType,
      category,
      description: description.trim() || undefined,
      priority,
      scheduledStart: toOffsetIso(scheduledStart) as string,
      scheduledEnd: toOffsetIso(scheduledEnd),
      reportedAt: maintenanceType === "corrective" ? toOffsetIso(reportedAt) : undefined,
      technicianWorkerId: technicianWorkerId || undefined,
      technicianName: technicianWorkerId ? undefined : technicianName.trim() || undefined,
      estimatedCost: optionalNumber(estimatedCost),
      actualCost: initial?.actualCost ?? undefined,
      partsUsed: initial?.partsUsed ?? undefined,
      notes: notes.trim() || undefined,
      recurrenceType: maintenanceType === "preventive" ? recurrenceType : "one_time",
    };

    setSaving(true);
    try {
      const saved = initial ? await maintenanceApi.update(initial.id, body) : await maintenanceApi.create(body, organizationId);
      toast.success(initial ? "Maintenance updated." : `Maintenance ${saved.maintenanceReference} scheduled.`);
      onSaved(saved);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) setErrors(apiError.errors);
      toast.error(apiError.message || "Could not save maintenance.");
    } finally {
      setSaving(false);
    }
  }

  const inProgress = initial?.status === "in_progress";

  return (
    <Modal title={isEdit ? `Edit ${initial?.maintenanceReference}` : "Schedule maintenance"} onClose={onClose} wide>
      {machinesLoading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          <Field label="Maintenance type" required>
            <div className="flex gap-2">
              {(["preventive", "corrective"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeType(t)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    maintenanceType === t ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold">{t === "preventive" ? "Preventive" : "Corrective"}</span>
                  <span className="block text-xs text-slate-500">
                    {t === "preventive" ? "Planned servicing, inspections, scheduled replacements" : "Breakdowns, repairs, fault diagnosis, emergencies"}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Machine" required hint={inProgress ? "The machine cannot be changed while work is in progress." : undefined}>
              <select className={inputClass} value={machineId} onChange={(e) => setMachineId(e.target.value)} disabled={inProgress}>
                <option value="">Select machine...</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.registrationNumber ? ` (${m.registrationNumber})` : ""}
                  </option>
                ))}
              </select>
              {errors.machineId && <p className="mt-1 text-xs text-red-600">{errors.machineId}</p>}
            </Field>
            <Field label="Project / site">
              <select className={inputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">None</option>
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Title" required>
            <input
              className={inputClass}
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={maintenanceType === "preventive" ? "e.g. 250-hour service" : "e.g. Hydraulic hose burst"}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Category">
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}>
                {CATEGORIES_BY_TYPE[maintenanceType].map((c) => (
                  <option key={c} value={c}>{MAINTENANCE_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </Field>
            <Field label={maintenanceType === "corrective" ? "Severity / priority" : "Priority"}>
              <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as MaintenancePriority)}>
                {MAINTENANCE_PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{MAINTENANCE_PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Scheduled start" required>
              <input type="datetime-local" className={inputClass} value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
              {errors.scheduledStart && <p className="mt-1 text-xs text-red-600">{errors.scheduledStart}</p>}
            </Field>
            <Field label="Scheduled end" hint="Optional. Without it, the task is overdue after the start day ends.">
              <input type="datetime-local" className={inputClass} value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} />
              {errors.scheduledEnd && <p className="mt-1 text-xs text-red-600">{errors.scheduledEnd}</p>}
            </Field>
          </div>

          {maintenanceType === "corrective" && (
            <Field label="Reported at" hint="When the fault/breakdown was reported. Defaults to now.">
              <input type="datetime-local" className={inputClass} value={reportedAt} onChange={(e) => setReportedAt(e.target.value)} />
            </Field>
          )}

          <Field label={maintenanceType === "corrective" ? "Problem description" : "Description"}>
            <textarea rows={3} className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Assigned technician (worker)">
              <select className={inputClass} value={technicianWorkerId} onChange={(e) => setTechnicianWorkerId(e.target.value)}>
                <option value="">None / external</option>
                {(workers ?? []).map((w) => (
                  <option key={w.id} value={w.id}>{w.employeeId} — {w.fullName}</option>
                ))}
              </select>
            </Field>
            <Field label="Technician name (if external)">
              <input
                className={inputClass}
                value={technicianName}
                maxLength={255}
                disabled={Boolean(technicianWorkerId)}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="e.g. OEM service engineer"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Estimated cost (₹)">
              <input type="number" min="0" step="0.01" className={inputClass} value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
              {errors.estimatedCost && <p className="mt-1 text-xs text-red-600">{errors.estimatedCost}</p>}
            </Field>
            {maintenanceType === "preventive" && (
              <Field label="Recurrence" hint={isEdit ? undefined : "Only the next single occurrence is created; the following one is created when that one is completed."}>
                <select className={inputClass} value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value as MaintenanceRecurrence)}>
                  {(Object.keys(MAINTENANCE_RECURRENCE_LABELS) as MaintenanceRecurrence[]).map((r) => (
                    <option key={r} value={r}>{MAINTENANCE_RECURRENCE_LABELS[r]}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field label="Notes">
            <textarea rows={2} className={`${inputClass} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          {Object.keys(errors).filter((k) => !["machineId", "title", "scheduledStart", "scheduledEnd", "estimatedCost"].includes(k)).length > 0 && (
            <ul className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
              {Object.entries(errors)
                .filter(([k]) => !["machineId", "title", "scheduledStart", "scheduledEnd", "estimatedCost"].includes(k))
                .map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          onClick={handleSubmit}
          disabled={saving || machinesLoading}
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Schedule Maintenance"}
        </button>
      </div>
    </Modal>
  );
}
