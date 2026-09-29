"use client";
import { EmptyState } from "@/components/common/states";
export default function GalleryPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Photo gallery</h1>
        <p className="mt-1 text-sm text-slate-500">Capture before-and-after progress for projects and daily work.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No photos yet" description="Multiple image upload, full-screen preview, before and after comparison" />
      </div>
    </>
  );
}
