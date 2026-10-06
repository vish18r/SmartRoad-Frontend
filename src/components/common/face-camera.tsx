"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { preloadFaceModels } from "@/lib/face/face";

export interface FaceCameraHandle {
  /** The live video element, for running detection on. */
  video: () => HTMLVideoElement | null;
}

interface FaceCameraProps {
  className?: string;
  onReady?: () => void;
}

export const FaceCamera = forwardRef<FaceCameraHandle, FaceCameraProps>(function FaceCamera({ className, onReady }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    video: () => videoRef.current,
  }));

  useEffect(() => {
    preloadFaceModels();
    let stream: MediaStream | null = null;
    let cancelled = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot access the camera.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then(async (media) => {
        if (cancelled) { media.getTracks().forEach(t => t.stop()); return; }
        stream = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play();
          onReadyRef.current?.();
        }
      })
      .catch(() => setError("Camera access was denied or no camera was found. Allow camera access in the address bar and reload."));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  return <video ref={videoRef} muted playsInline className={className ?? "aspect-[4/3] w-full rounded-lg bg-black object-cover -scale-x-100"} />;
});
