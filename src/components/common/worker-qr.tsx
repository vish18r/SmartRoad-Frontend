"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// A worker QR carries only the public employee ID, never personal or credential data.
export const WORKER_QR_PREFIX = "WORKER:";

export function workerQrText(employeeId: string): string {
  return `${WORKER_QR_PREFIX}${employeeId}`;
}

interface WorkerQrProps {
  employeeId: string;
  name?: string;
}

export function WorkerQr({ employeeId, name }: WorkerQrProps) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(workerQrText(employeeId), { width: 256, margin: 2, errorCorrectionLevel: "M" })
      .then(url => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setDataUrl(""); });
    return () => { cancelled = true; };
  }, [employeeId]);

  if (!dataUrl) return <p className="text-sm text-slate-500">Generating QR code...</p>;
  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR code for ${employeeId}`} width={192} height={192} />
      <p className="text-sm font-semibold text-slate-900">{employeeId}{name ? ` — ${name}` : ""}</p>
      <a href={dataUrl} download={`${employeeId}-qr.png`} className="text-xs font-medium text-orange-600 hover:underline">Download QR</a>
    </div>
  );
}
