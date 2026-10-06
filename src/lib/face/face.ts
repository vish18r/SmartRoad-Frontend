"use client";

// Browser-side face capture built on @vladmandic/face-api. Models are served from
// /public/models. The browser only turns a face into a 128-value descriptor; the backend
// stores descriptors and does all matching, so no template is ever sent back to the client.

import type * as FaceApi from "@vladmandic/face-api";

let apiPromise: Promise<typeof FaceApi> | null = null;

async function loadApi(): Promise<typeof FaceApi> {
  apiPromise ??= (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    return faceapi;
  })().catch((error) => {
    apiPromise = null;
    throw error;
  });
  return apiPromise;
}

export function preloadFaceModels(): void {
  void loadApi().catch(() => undefined);
}

/** Returns the descriptor of the single most prominent face in the frame, or null when none is found. */
export async function detectDescriptor(source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement): Promise<number[] | null> {
  const faceapi = await loadApi();
  const result = await faceapi
    .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return result ? Array.from(result.descriptor) : null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function average(descriptors: number[][]): number[] {
  return descriptors[0].map((_, i) => descriptors.reduce((sum, d) => sum + d[i], 0) / descriptors.length);
}

function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

// A frame further than this from the average of the rest (blurred, head turned) is dropped.
const OUTLIER_DISTANCE = 0.4;

interface CaptureOptions {
  /** Frames to collect before averaging. */
  frames: number;
  /** Fewest usable frames for a capture to count. */
  minFrames: number;
  /** Pause before the first frame, so a camera that has just started can settle its exposure. */
  warmupMs?: number;
  intervalMs?: number;
  maxAttempts?: number;
}

/**
 * Captures a face as the average of several frames. One frame is noisy: the same person can come out far
 * enough apart between two single frames to fail matching, while averaged templates agree closely.
 * Frames that disagree with the rest are discarded. Returns null when no stable face was seen.
 */
export async function captureDescriptor(source: HTMLVideoElement, options: CaptureOptions): Promise<number[] | null> {
  const { frames, minFrames, warmupMs = 0, intervalMs = 200, maxAttempts = frames * 3 } = options;
  if (warmupMs) await sleep(warmupMs);

  const found: number[][] = [];
  for (let attempt = 0; attempt < maxAttempts && found.length < frames; attempt++) {
    const descriptor = await detectDescriptor(source);
    if (descriptor) found.push(descriptor);
    if (found.length < frames) await sleep(intervalMs);
  }
  if (found.length < minFrames) return null;

  const mean = average(found);
  const consistent = found.filter(d => euclidean(d, mean) <= OUTLIER_DISTANCE);
  return consistent.length >= minFrames ? average(consistent) : null;
}
