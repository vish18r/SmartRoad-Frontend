"use client";

import { useEffect, useRef, useState } from "react";
import { FaceCamera, type FaceCameraHandle } from "@/components/common/face-camera";
import { QrScanner } from "@/components/common/qr-scanner";
import { captureDescriptor } from "@/lib/face/face";
import { apiClient } from "@/lib/api/api-client";
import { formatClock, formatDay, METHOD_LABELS, STATE_LABELS, STATE_STYLES } from "@/lib/attendance-format";
import type { AttendanceEvent } from "@/types/attendance";
import type { ApiError } from "@/types/api";

type Mode = "idle" | "face" | "qr";

interface WorkerCheckinProps {
  projectId: string;
  onChanged: () => void;
}

const TRACKING = "/nextenti/tracking";
const SCAN_INTERVAL_MS = 800;
const AFTER_SUCCESS_PAUSE_MS = 6000;
const AFTER_REJECT_PAUSE_MS = 2500;

function currentPosition(): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), () => resolve(null), { enableHighAccuracy: true, timeout: 5000 });
  });
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Worker check-in and check-out by face or by worker QR code. Only the captured face or the scanned
 * text is sent: the backend identifies the worker, decides whether this is a check-in or a check-out
 * from the worker's open session, and stamps the time on the server. Nothing is typed in, and a face
 * is never registered here.
 */
export function FaceCheckin({ projectId, onChanged }: WorkerCheckinProps) {
  const camera = useRef<FaceCameraHandle>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<AttendanceEvent | null>(null);
  const [error, setError] = useState("");

  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    if (mode !== "face" || !ready) return;
    let stopped = false;
    setStatus("Position your face inside the frame.");

    const attempt = async (): Promise<number> => {
      const video = camera.current?.video();
      if (!video) return SCAN_INTERVAL_MS;
      const descriptor = await captureDescriptor(video, { frames: 3, minFrames: 2, intervalMs: 150, maxAttempts: 8 });
      if (!descriptor || stopped) return SCAN_INTERVAL_MS;

      setStatus("Recognizing...");
      const coords = await currentPosition();
      try {
        const outcome = await apiClient.post<AttendanceEvent>(`${TRACKING}/checkin/face`, {
          projectId,
          faceDescriptor: JSON.stringify(descriptor),
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          accuracy: coords?.accuracy,
        });
        setResult(outcome);
        setError("");
        setStatus("");
        onChangedRef.current();
        return AFTER_SUCCESS_PAUSE_MS;
      } catch (err) {
        setResult(null);
        setError((err as ApiError).message || "Face check-in failed.");
        setStatus("");
        return AFTER_REJECT_PAUSE_MS;
      }
    };

    const loop = async () => {
      while (!stopped) {
        let pause = SCAN_INTERVAL_MS;
        try {
          pause = await attempt();
        } catch {
          setStatus("Face recognition could not start. Reload the page and try again.");
          return;
        }
        await sleep(pause);
        if (!stopped) setStatus("Position your face inside the frame.");
      }
    };
    void loop();
    return () => { stopped = true; };
  }, [mode, ready, projectId]);

  async function handleQr(text: string) {
    setMode("idle");
    setError("");
    setResult(null);
    const coords = await currentPosition();
    try {
      const outcome = await apiClient.post<AttendanceEvent>(`${TRACKING}/checkin/qr`, {
        projectId,
        qrCode: text,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        accuracy: coords?.accuracy,
      });
      setResult(outcome);
      onChangedRef.current();
    } catch (err) {
      setError((err as ApiError).message || "QR check-in failed.");
    }
  }

  function stop() {
    setMode("idle");
    setReady(false);
    setStatus("");
  }

  function start(next: Mode) {
    setError("");
    setResult(null);
    setMode(next);
  }

  return (
    <div className="space-y-3">
      {mode === "face" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <FaceCamera ref={camera} onReady={() => setReady(true)} />
          <p role="status" className="mt-3 text-sm text-slate-600">{ready ? status : "Starting camera..."}</p>
          <button type="button" onClick={stop} className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Stop camera</button>
        </div>
      )}
      {mode === "qr" && <QrScanner onScan={handleQr} onClose={stop} />}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => start("qr")} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Scan worker QR</button>
          <button type="button" onClick={() => start("face")} className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">Scan face</button>
        </div>
      )}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-bold text-green-900">Welcome, {result.workerName ?? "worker"}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATE_STYLES[result.status]}`}>{STATE_LABELS[result.status]}</span>
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            <dt className="text-green-800">Employee ID</dt><dd className="font-semibold text-slate-900">{result.employeeId ?? "—"}</dd>
            <dt className="text-green-800">Date</dt><dd className="font-semibold text-slate-900">{formatDay(result.attendanceDate)}</dd>
            <dt className="text-green-800">Check-in time</dt>
            <dd className="font-semibold text-slate-900">{formatClock(result.checkInTime)} · {METHOD_LABELS[result.checkInMethod] ?? result.checkInMethod}</dd>
            {result.checkOutTime && (
              <>
                <dt className="text-green-800">Check-out time</dt>
                <dd className="font-semibold text-slate-900">{formatClock(result.checkOutTime)} · {result.checkOutMethod ? (METHOD_LABELS[result.checkOutMethod] ?? result.checkOutMethod) : "—"}</dd>
                <dt className="text-green-800">Session length</dt><dd className="font-semibold text-slate-900">{result.workDuration}</dd>
              </>
            )}
          </dl>
        </div>
      )}
      {error && <p role="status" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
