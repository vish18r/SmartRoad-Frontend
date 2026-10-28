"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { maintenanceApi } from "@/lib/api/maintenance-api";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { ErrorState, Loading } from "@/components/common/states";
import { PriorityBadge, StatusBadge, inputClass } from "@/components/maintenance/maintenance-ui";
import { MaintenanceFormDialog, recordToRequest } from "@/components/maintenance/maintenance-form";
import { MaintenanceActionDialog, type MaintenanceAction } from "@/components/maintenance/maintenance-action-dialogs";
import { formatINR } from "@/lib/currency";
import {
  MAINTENANCE_CATEGORY_LABELS,
  MAINTENANCE_RECURRENCE_LABELS,
  MAINTENANCE_TYPE_LABELS,
  formatDateTime,
  formatDowntime,
  humanize,
} from "@/lib/maintenance-format";
import type { ApiError } from "@/types/api";
import type { MaintenanceRecord } from "@/types/maintenance";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function NotRecorded() {
  return <span className="font-normal italic text-slate-400">Not recorded</span>;
}

export default function MaintenanceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [action, setAction] = useState<MaintenanceAction | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const { data: record, loading, error, refetch } = useApi<MaintenanceRecord>(
    () => maintenanceApi.getById(id),
    { skip: !id, deps: [id] }
  );

  const { data: history, refetch: refetchHistory } = useApi(
    () => maintenanceApi.getMachineHistory(record?.machineId as string, { organizationId: record?.organizationId, limit: 10 }),
    { skip: !record?.machineId, deps: [record?.machineId, record?.organizationId] }
  );

  function refreshAll() {
    refetch();
    refetchHistory();
  }

  async function saveNotes() {
    if (!record) return;
    setSavingNotes(true);
    try {
      await maintenanceApi.update(record.id, { ...recordToRequest(record), notes: notesDraft.trim() || undefined });
      toast.success("Notes saved.");
      setEditingNotes(false);
      refetch();
    } catch (err) {
      toast.error((err as ApiError).message || "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading && !record) return <Loading />;
  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/maintenance" className="text-sm text-orange-600 hover:underline">← Back to maintenance</Link>
        <ErrorState message={error.status === 404 ? "Maintenance record not found." : error.message} />
      </div>
    );
  }
  if (!record) return null;

  const estimated = record.estimatedCost;
  const actual = record.actualCost;
  const variance = estimated != null && actual != null ? actual - estimated : null;
  const otherHistory = (history?.items ?? []).filter((h) => h.id !== record.id);

  return (
    <>
      <Link href="/maintenance" className="text-sm text-orange-600 hover:underline">← Back to maintenance</Link>

      <div className="animate-fade-in-up mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-orange-600">{record.maintenanceReference}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{record.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
            <span>{MAINTENANCE_TYPE_LABELS[record.maintenanceType]} · {MAINTENANCE_CATEGORY_LABELS[record.category]}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {record.editable && (
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setShowEdit(true)}>
              Edit
            </button>
          )}
          {record.canStart && (
            <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700" onClick={() => setAction("start")}>
              Start
            </button>
          )}
          {record.canComplete && (
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => setAction("complete")}>
              Complete
            </button>
          )}
          {record.canCancel && (
            <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50" onClick={() => setAction("cancel")}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {record.status === "overdue" && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">This maintenance was due by {formatDateTime(record.dueBy)} and has not been started.</p>
      )}
      {record.status === "due" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">This maintenance is due — scheduled to start {formatDateTime(record.scheduledStart)}.</p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Section
          title="Machine"
          action={<Link href={`/machine-utilization/${record.machineId}`} className="text-xs text-orange-600 hover:underline">Utilization →</Link>}
        >
          <dl className="divide-y divide-slate-100">
            <Row label="Name" value={record.machineName ?? "—"} />
            <Row label="Type" value={record.machineType ?? "—"} />
            <Row label="Registration" value={record.machineRegistrationNumber ?? "—"} />
            <Row label="Maintenance label" value={record.machineMaintenanceStatus ? humanize(record.machineMaintenanceStatus) : "—"} />
            <Row label="Project / site" value={record.projectName ?? "—"} />
          </dl>
        </Section>

        <Section title="Schedule">
          <dl className="divide-y divide-slate-100">
            <Row label="Scheduled start" value={formatDateTime(record.scheduledStart)} />
            <Row label="Scheduled end" value={record.scheduledEnd ? formatDateTime(record.scheduledEnd) : "—"} />
            <Row label="Due by" value={formatDateTime(record.dueBy)} />
            <Row label="Recurrence" value={MAINTENANCE_RECURRENCE_LABELS[record.recurrenceType]} />
            {record.parentMaintenanceId && (
              <Row label="Generated from" value={<Link href={`/maintenance/${record.parentMaintenanceId}`} className="text-orange-600 hover:underline">Previous occurrence</Link>} />
            )}
            {record.reportedAt && <Row label="Reported at" value={formatDateTime(record.reportedAt)} />}
            <Row label="Technician" value={record.technicianName ?? "—"} />
          </dl>
        </Section>

        <Section title="Actual times & downtime">
          <dl className="divide-y divide-slate-100">
            <Row label="Actual start" value={record.actualStart ? formatDateTime(record.actualStart) : <NotRecorded />} />
            <Row label="Actual end" value={record.actualEnd ? formatDateTime(record.actualEnd) : <NotRecorded />} />
            <Row label="Downtime" value={record.downtimeMinutes != null ? formatDowntime(record.downtimeMinutes) : <NotRecorded />} />
          </dl>
          <p className="mt-2 text-xs text-slate-400">Downtime is calculated by the server from the actual start and end.</p>
        </Section>

        <Section title="Cost breakdown">
          <dl className="divide-y divide-slate-100">
            <Row label="Estimated cost" value={estimated != null ? formatINR(estimated) : <NotRecorded />} />
            <Row label="Actual cost" value={actual != null ? formatINR(actual) : <NotRecorded />} />
            <Row
              label="Variance"
              value={
                variance != null ? (
                  <span className={variance > 0 ? "text-red-600" : "text-emerald-600"}>
                    {variance > 0 ? "+" : ""}
                    {formatINR(variance)}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Parts used" value={record.partsUsed ? <span className="whitespace-pre-wrap">{record.partsUsed}</span> : "—"} />
          </dl>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section title={record.maintenanceType === "corrective" ? "Problem description" : "Description"}>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{record.description || "—"}</p>
          {record.cancellationReason && (
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium">Cancellation reason:</span> {record.cancellationReason}
            </p>
          )}
        </Section>

        <Section
          title="Notes"
          action={
            !editingNotes ? (
              <button
                className="text-xs text-orange-600 hover:underline"
                onClick={() => {
                  setNotesDraft(record.notes ?? "");
                  setEditingNotes(true);
                }}
              >
                Edit notes
              </button>
            ) : undefined
          }
        >
          {editingNotes ? (
            <div className="space-y-2">
              <textarea rows={4} className={`${inputClass} resize-none`} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50" onClick={() => setEditingNotes(false)} disabled={savingNotes}>
                  Cancel
                </button>
                <button className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60" onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? "Saving..." : "Save notes"}
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-slate-700">{record.notes || "—"}</p>
          )}
        </Section>
      </div>

      <div className="mt-4">
        <Section title={`Maintenance history — ${record.machineName ?? "this machine"}`}>
          {otherHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No other maintenance recorded for this machine.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {otherHistory.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div>
                    <Link href={`/maintenance/${h.id}`} className="font-medium text-slate-900 hover:text-orange-600 hover:underline">
                      {h.maintenanceReference} · {h.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(h.scheduledStart)} · {MAINTENANCE_TYPE_LABELS[h.maintenanceType]}
                      {h.actualCost != null ? ` · ${formatINR(h.actualCost)}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={h.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {showEdit && (
        <MaintenanceFormDialog organizationId={record.organizationId} initial={record} onClose={() => setShowEdit(false)} onSaved={refreshAll} />
      )}

      {action && <MaintenanceActionDialog record={record} action={action} onClose={() => setAction(null)} onDone={refreshAll} />}
    </>
  );
}
