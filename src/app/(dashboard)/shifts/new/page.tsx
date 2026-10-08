"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { shiftApi } from "@/lib/api/shift-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { ErrorState } from "@/components/common/states";
import { ShiftForm, type ShiftFormValues } from "@/components/shifts/shift-form";
import type { ApiError } from "@/types/api";

export default function NewShiftPage() {
  const router = useRouter();
  const { organizationId } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: ShiftFormValues) {
    if (!organizationId) return;
    setError("");
    setSaving(true);
    try {
      const created = await shiftApi.create({
        organizationId,
        shiftCode: values.shiftCode.trim(),
        shiftName: values.shiftName.trim(),
        startTime: values.startTime,
        endTime: values.endTime,
        breakDurationMinutes: Number(values.breakDurationMinutes || 0),
        description: values.description.trim() || undefined,
        status: values.status,
      });
      router.push(`/shifts/${created.id}`);
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
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Create shift</h1>
        <p className="mt-1 text-sm text-slate-500">Define a reusable shift template that workers can be assigned to.</p>
      </div>

      {!organizationId ? (
        <div className="mt-6"><ErrorState message="Select an organization from the top bar first." /></div>
      ) : (
        <div className="mt-6 max-w-2xl">
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <ShiftForm submitting={saving} submitLabel="Create shift" onCancel={() => router.push("/shifts")} onSubmit={handleSubmit} />
        </div>
      )}
    </>
  );
}
