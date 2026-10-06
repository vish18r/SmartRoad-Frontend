"use client";

import { useRef, useState } from "react";
import { FaceCamera, type FaceCameraHandle } from "@/components/common/face-camera";
import { captureDescriptor } from "@/lib/face/face";
import { workersApi } from "@/lib/api/workers-api";
import type { WorkerResponse } from "@/types/worker";
import type { ApiError } from "@/types/api";

interface FaceRegistrationProps {
  worker: WorkerResponse;
  onDone: (worker: WorkerResponse) => void;
  onCancel?: () => void;
}

export function FaceRegistration({ worker, onDone, onCancel }: FaceRegistrationProps) {
  const camera = useRef<FaceCameraHandle>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function capture() {
    const video = camera.current?.video();
    if (!video) return;
    setBusy(true);
    setMessage("Hold still, looking at the camera...");
    try {
      // Hold still: several frames are averaged into one face template.
      const descriptor = await captureDescriptor(video, { frames: 5, minFrames: 3, warmupMs: 700 });
      if (!descriptor) {
        setMessage("No steady face found. Face the camera in good light, hold still and try again.");
        return;
      }
      setMessage("Saving...");
      const updated = await workersApi.registerFace(worker.id, descriptor);
      onDone(updated);
    } catch (err) {
      setMessage((err as ApiError).message || "Could not register the face.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Registering the face of <span className="font-semibold text-slate-900">{worker.firstName} {worker.lastName ?? ""}</span>
        {worker.employeeId && <> (<span className="font-semibold">{worker.employeeId}</span>)</>}. Ask them to look straight at the camera.
      </p>
      <FaceCamera ref={camera} onReady={() => setReady(true)} />
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={capture} disabled={!ready || busy} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
          {busy ? "Working..." : "Capture face"}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>}
      </div>
    </div>
  );
}
