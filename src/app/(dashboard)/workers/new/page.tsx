"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { workersApi } from "@/lib/api/workers-api";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { FaceCamera, type FaceCameraHandle } from "@/components/common/face-camera";
import { WorkerQr } from "@/components/common/worker-qr";
import { captureVerifiedDescriptor } from "@/lib/face/face";
import type { WorkerResponse } from "@/types/worker";

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";
const MOBILE_RE = /^\+?[0-9]{10,}$/;

export default function NewWorkerPage() {
  const { organizationId } = useWorkspace();
  const camera = useRef<FaceCameraHandle>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [wageType, setWageType] = useState<"daily" | "monthly">("daily");
  const [dailyWage, setDailyWage] = useState("");
  const [monthlyWage, setMonthlyWage] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [faceMessage, setFaceMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [worker, setWorker] = useState<WorkerResponse | null>(null);

  const set = (field: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  function reset() {
    setWorker(null);
    setForm({ firstName: "", lastName: "", phoneNumber: "" });
    setDescriptor(null);
    setFaceMessage("");
    setError("");
  }

  async function captureFace() {
    const video = camera.current?.video();
    if (!video) return;
    setCapturing(true); setFaceMessage("Hold still, looking at the camera...");
    try {
      // Hold still: several frames are averaged into one face template.
      const capture = await captureVerifiedDescriptor(video);
      const found = capture.descriptor;
      setDescriptor(found);
      setFaceMessage(found ? "Face captured and verified." : capture.reason === "unsteady"
        ? "The face was not steady. Look straight at the camera, hold still in good light and capture again."
        : "No face found. Face the camera in good light and capture again.");
    } catch {
      setFaceMessage("Face recognition could not start. Reload the page and try again.");
    } finally {
      setCapturing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) { setError("Select an organization from the top bar first."); return; }
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.lastName.trim()) { setError("Last name is required."); return; }
    if (!form.phoneNumber.trim()) { setError("Mobile number is required."); return; }
    if (!MOBILE_RE.test(form.phoneNumber.trim())) { setError("Enter a valid mobile number (at least 10 digits)."); return; }
    if (!descriptor) { setError("Capture the worker's face before registering."); return; }

    setSaving(true); setError("");
    try {
      setWorker(await workersApi.create({
        organizationId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        status: "active",
        faceDescriptor: JSON.stringify(descriptor),
        wageType,
        dailyWage: wageType === "daily" && dailyWage.trim() ? Number(dailyWage) : undefined,
        monthlyWage: wageType === "monthly" && monthlyWage.trim() ? Number(monthlyWage) : undefined,
        overtimeRate: overtimeRate.trim() ? Number(overtimeRate) : undefined,
      }));
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to register worker.");
    } finally {
      setSaving(false);
    }
  }

  if (worker) {
    return (
      <div className="max-w-xl">
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h1 className="text-xl font-bold text-green-900">Worker Registered Successfully</h1>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-green-800">Employee ID</dt>
            <dd className="text-2xl font-bold text-slate-900">{worker.employeeId}</dd>
            <dt className="text-green-800">Name</dt>
            <dd className="font-medium text-slate-900">{worker.fullName}</dd>
            <dt className="text-green-800">Mobile</dt>
            <dd className="font-medium text-slate-900">{worker.phoneNumber}</dd>
            <dt className="text-green-800">Face</dt>
            <dd className="font-medium text-slate-900">{worker.faceStatus === "FACE_REGISTERED" ? "Registered ✓" : "Not registered"}</dd>
          </dl>
          <p className="mt-4 text-sm text-green-800">{worker.firstName} can now check in with their face or this QR code.</p>
          <div className="mt-4"><WorkerQr employeeId={worker.employeeId} name={worker.fullName} /></div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={reset} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">Register another worker</button>
            <Link href="/workers" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to workers</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <p className="text-sm font-medium text-orange-600">Smart Road</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Register worker</h1>
      <p className="mt-1 text-sm text-slate-500">Employee ID will be generated automatically.</p>

      {!organizationId && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Select an organization from the top bar first.</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Worker details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First name <span className="text-red-500">*</span></label>
              <input value={form.firstName} onChange={e => set("firstName", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last name / Surname <span className="text-red-500">*</span></label>
              <input value={form.lastName} onChange={e => set("lastName", e.target.value)} className={INPUT} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mobile number <span className="text-red-500">*</span></label>
            <input value={form.phoneNumber} onChange={e => set("phoneNumber", e.target.value)} placeholder="9876543210" inputMode="tel" className={INPUT} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Wage configuration</h2>
          <p className="text-sm text-slate-500">Used by payroll to calculate this worker&apos;s wages. Can be left blank and set later.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Wage type</label>
              <select value={wageType} onChange={(e) => setWageType(e.target.value as "daily" | "monthly")} className={INPUT}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {wageType === "daily" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Daily wage (₹)</label>
                <input type="number" min="0" step="0.01" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} className={INPUT} />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monthly wage (₹)</label>
                <input type="number" min="0" step="0.01" value={monthlyWage} onChange={(e) => setMonthlyWage(e.target.value)} className={INPUT} />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Overtime rate (₹/hr)</label>
              <input type="number" min="0" step="0.01" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} className={INPUT} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Face capture <span className="text-red-500">*</span></h2>
          <p className="text-sm text-slate-500">Ask the worker to look straight at the camera, then capture. Only a numeric face template is saved, not the image.</p>
          <FaceCamera ref={camera} onReady={() => setCameraReady(true)} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={captureFace} disabled={!cameraReady || capturing} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {capturing ? "Capturing..." : descriptor ? "Capture again" : "Capture face"}
            </button>
            {faceMessage && <p role="status" className={`text-sm ${descriptor ? "text-green-700" : "text-slate-600"}`}>{faceMessage}</p>}
          </div>
        </section>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || !organizationId} className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
            {saving ? "Registering..." : "Register worker"}
          </button>
          <Link href="/workers" className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
