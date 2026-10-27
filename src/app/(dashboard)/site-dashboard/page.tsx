"use client";

import { useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard-api";
import { materialApi } from "@/lib/api/material-api";
import { trackingApi } from "@/lib/api/tracking-api";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import { PRODUCT_NAME } from "@/constants/branding";
import type { ApiError } from "@/types/api";
import type { MaterialResponse } from "@/types/material";
import type { SiteActivityEvent, SiteActivityEventType, SiteDashboardResponse } from "@/types/site-dashboard";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

// Lengths are stored in metres; switch to kilometres once metres stop being
// readable at a glance.
function formatLength(metres: number) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${metres.toFixed(0)} m`;
}

function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const ACTIVITY_BADGES: Record<SiteActivityEventType, string> = {
  CHECK_IN: "bg-green-100 text-green-700",
  CHECK_OUT: "bg-slate-100 text-slate-600",
  MATERIAL_RECEIVED: "bg-green-100 text-green-700",
  MATERIAL_CONSUMED: "bg-amber-100 text-amber-700",
  MATERIAL_TRANSFER: "bg-blue-100 text-blue-700",
  PHOTO_UPLOADED: "bg-orange-100 text-orange-700",
  DIARY_UPDATED: "bg-slate-100 text-slate-600",
};

const ACTIVITY_LABELS: Record<SiteActivityEventType, string> = {
  CHECK_IN: "Check-in",
  CHECK_OUT: "Check-out",
  MATERIAL_RECEIVED: "Material received",
  MATERIAL_CONSUMED: "Material consumed",
  MATERIAL_TRANSFER: "Material transfer",
  PHOTO_UPLOADED: "Photo uploaded",
  DIARY_UPDATED: "Diary updated",
};

function ActivityBadge({ type }: { type: SiteActivityEvent["type"] }) {
  const className = ACTIVITY_BADGES[type] ?? "bg-slate-100 text-slate-600";
  const label = ACTIVITY_LABELS[type] ?? type.replace(/_/g, " ");
  return <span className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]";

type MaterialModalMode = "receive" | "consume" | null;

function MaterialStockModal({
  mode,
  projectId,
  materials,
  onClose,
  onSaved,
}: {
  mode: Exclude<MaterialModalMode, null>;
  projectId: string;
  materials: MaterialResponse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [materialId, setMaterialId] = useState(materials[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [unitRate, setUnitRate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!materialId || !quantity) return;
    setSaving(true);
    try {
      if (mode === "receive") {
        await materialApi.receiveStock(materialId, {
          projectId,
          quantity: Number(quantity),
          unitRate: unitRate ? Number(unitRate) : undefined,
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined,
        });
        toast.success("Stock received.");
      } else {
        await materialApi.consumeStock(materialId, {
          projectId,
          quantity: Number(quantity),
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined,
        });
        toast.success("Consumption recorded.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={mode === "receive" ? "Receive stock" : "Record consumption"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Material</label>
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} required className={inputClass}>
            {materials.length === 0 && <option value="">No materials available</option>}
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.materialName} ({m.materialCode})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
          <input type="number" step="0.01" min="0" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
        </div>
        {mode === "receive" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Unit rate (optional)</label>
            <input type="number" step="0.01" min="0" value={unitRate} onChange={(e) => setUnitRate(e.target.value)} className={inputClass} />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Reference number (optional)</label>
          <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving || !materialId} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const PHOTO_TYPES = ["Progress", "Issue", "Safety", "Material", "Other"];

function UploadPhotoModal({ projectId, onClose, onSaved }: { projectId: string; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState(PHOTO_TYPES[0]);
  const [description, setDescription] = useState("");
  const [workArea, setWorkArea] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("photoType", photoType);
      if (description) formData.append("description", description);
      if (workArea) formData.append("workArea", workArea);
      await trackingApi.uploadWorkPhoto(formData);
      toast.success("Photo uploaded.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to upload photo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Upload photo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Photo</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Photo type</label>
          <select value={photoType} onChange={(e) => setPhotoType(e.target.value)} className={inputClass}>
            {PHOTO_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Work area (optional)</label>
          <input type="text" value={workArea} onChange={(e) => setWorkArea(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description (optional)</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving || !file} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
            {saving ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function SiteDashboardPage() {
  const { projectId } = useWorkspace();
  const [date, setDate] = useState(todayIso());
  const [materialModal, setMaterialModal] = useState<MaterialModalMode>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data, loading, error, refetch } = useApi<SiteDashboardResponse>(
    () => dashboardApi.getSiteDashboard(projectId as string, date),
    { skip: !projectId, deps: [projectId, date] }
  );

  const { data: materials } = useApi<MaterialResponse[]>(
    () => materialApi.list(projectId ?? undefined),
    { skip: !projectId, deps: [projectId] }
  );

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{PRODUCT_NAME}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Site dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          A supervisor view of today&apos;s work, attendance, materials, and photos.
        </p>
      </div>
      <label className="text-xs font-semibold text-slate-600">
        <span className="mb-1 block">Date</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
        />
      </label>
    </div>
  );

  if (!projectId) {
    return (
      <div>
        {header}
        <div className="mt-7">
          <EmptyState
            title="No site selected"
            description="Pick a project from the workspace selector in the header to see its site dashboard."
          />
        </div>
      </div>
    );
  }

  if (loading) return <div>{header}<div className="mt-7"><Loading /></div></div>;
  if (error) return <div>{header}<div className="mt-7"><ErrorState message={error.message} /></div></div>;
  if (!data) {
    return (
      <div>
        {header}
        <div className="mt-7">
          <EmptyState title="No site dashboard data yet" description="Nothing has been recorded for this site on this date." />
        </div>
      </div>
    );
  }

  const { work, workforce, materials: materialStats, photos } = data;
  const diary = data.diary ?? null;
  const materialsToday = data.materialsToday ?? { receivedQuantity: 0, consumedQuantity: 0 };
  const activity = data.activity ?? [];

  return (
    <div>
      {header}

      <p className="mt-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{data.projectName}</span>
        {data.projectCode && <span className="text-slate-500"> · {data.projectCode}</span>}
      </p>

      <Section title="Today's work and completion">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Completion" value={`${work.completionPercentage}%`} hint={`${work.projectStatus} · ${work.projectProgress}% reported`} />
          <Stat label="Built" value={formatLength(work.completedLengthM)} hint={`of ${formatLength(work.totalLengthM)} planned`} />
          <Stat label="Remaining" value={formatLength(work.remainingLengthM)} />
          <Stat label="Roads" value={`${work.completedRoads}/${work.totalRoads}`} hint="completed / total" />
        </div>

        {diary ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site diary</p>
              {(diary.weather || diary.temperatureCelsius != null) && (
                <p className="text-xs text-slate-500">
                  {diary.weather}
                  {diary.temperatureCelsius != null ? ` · ${diary.temperatureCelsius}°C` : ""}
                </p>
              )}
            </div>
            {diary.workSummary && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{diary.workSummary}</p>}
            {diary.issues && (
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-amber-700">Issues: {diary.issues}</p>
            )}
            {diary.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{diary.notes}</p>}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No site diary entry for this date.{" "}
            <a href="/site-diary" className="font-semibold text-orange-600 hover:text-orange-700">
              Add diary entry →
            </a>
          </p>
        )}
      </Section>

      <Section title="Workers and attendance">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Posted to site" value={String(workforce.assignedWorkers)} hint={`${workforce.marked} marked today`} />
          <Stat label="Present" value={String(workforce.present)} hint={`${workforce.halfDay} half day · ${workforce.absent} absent · ${workforce.onLeave} leave`} />
          <Stat label="Checked in" value={String(workforce.checkedIn)} hint={`${workforce.stillOnSite} still on site`} />
          <Stat label="Hours worked" value={String(workforce.hoursWorked)} />
        </div>
        <p className="mt-3">
          <a href="/attendance" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            View full attendance →
          </a>
        </p>
      </Section>

      <Section title="Materials on site">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Tracked materials" value={String(materialStats.trackedMaterials)} />
          <Stat label="Low stock" value={String(materialStats.lowStockMaterials)} hint="at or below reorder level" />
          <Stat label="Stock value" value={`₹${materialStats.stockValue}`} />
          <Stat label="Received today" value={String(materialsToday.receivedQuantity)} />
          <Stat label="Consumed today" value={String(materialsToday.consumedQuantity)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setMaterialModal("receive")}
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            Receive stock
          </button>
          <button
            onClick={() => setMaterialModal("consume")}
            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
          >
            Record consumption
          </button>
        </div>
      </Section>

      <Section title="Site photos">
        <div className="mb-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Upload photo
          </button>
        </div>
        {photos.photosToday === 0 ? (
          <EmptyState title="No photos for this date" description="Photos uploaded against this site will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {photos.recent.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.photoUrl} alt={photo.description || photo.photoType} className="h-36 w-full object-cover" />
                <figcaption className="p-3">
                  <p className="text-xs font-semibold text-slate-800">{photo.photoType}</p>
                  {photo.workArea && <p className="text-xs text-slate-500">{photo.workArea}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>

      <Section title="Recent activity">
        {activity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Check-ins, material movements, photo uploads, and diary updates for this site will appear here."
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
            <ul className="divide-y divide-slate-100">
              {activity.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <ActivityBadge type={event.type} />
                  <p className="flex-1 text-sm text-slate-700">{event.description}</p>
                  <p className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {materialModal && (
        <MaterialStockModal
          mode={materialModal}
          projectId={projectId}
          materials={materials ?? []}
          onClose={() => setMaterialModal(null)}
          onSaved={refetch}
        />
      )}

      {showUploadModal && (
        <UploadPhotoModal projectId={projectId} onClose={() => setShowUploadModal(false)} onSaved={refetch} />
      )}
    </div>
  );
}
