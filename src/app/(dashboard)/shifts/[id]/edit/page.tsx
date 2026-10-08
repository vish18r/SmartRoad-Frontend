"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { shiftApi } from "@/lib/api/shift-api";
import { Loading, ErrorState } from "@/components/common/states";
import { ShiftForm, type ShiftFormValues } from "@/components/shifts/shift-form";
import type { ShiftResponse } from "@/types/shift";
import type { ApiError } from "@/types/api";

export default function EditShiftPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");
    shiftApi.getById(id)
      .then(setShift)
      .catch((e: ApiError) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(values: ShiftFormValues) {
    if (!shift) return;
    setError("");
    setSaving(true);
    try {
      const updated = await shiftApi.update(shift.id, {
        organizationId: shift.organizationId,
        shiftCode: values.shiftCode.trim(),
        shiftName: values.shiftName.trim(),
        startTime: values.startTime,
        endTime: values.endTime,
        breakDurationMinutes: Number(values.breakDurationMinutes || 0),
        description: values.description.trim() || undefined,
        status: values.status,
      });
      router.push(`/shifts/${updated.id}`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;
  if (loadError || !shift) return <ErrorState message={loadError || "Shift not found."} />;

  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Edit shift — {shift.shiftName}</h1>
        <p className="mt-1 text-sm text-slate-500">Update this shift template&apos;s timing, break duration or status.</p>
      </div>

      <div className="mt-6 max-w-2xl">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <ShiftForm initial={shift} submitting={saving} submitLabel="Save changes" onCancel={() => router.push(`/shifts/${shift.id}`)} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
