"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QrScannerProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let done = false;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (done || !video || !canvas) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });
          if (result?.data) {
            done = true;
            onScanRef.current(result.data);
            return;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot access the camera. Enter the code manually.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then(async (media) => {
        if (done) { media.getTracks().forEach(t => t.stop()); return; }
        stream = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play();
        }
        frame = requestAnimationFrame(tick);
      })
      .catch(() => setError("Camera access was denied or no camera was found. Allow camera access in the address bar, or enter the code manually."));

    return () => {
      done = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-lg bg-black object-cover" />
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">Hold the worker QR code in front of the camera.</p>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
      </div>
    </div>
  );
}
