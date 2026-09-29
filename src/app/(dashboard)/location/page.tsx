"use client";
import { EmptyState } from "@/components/common/states";
export default function LocationPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project locations</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare project addresses and coordinates for field teams.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No locations set" description="Address and coordinates, open in Google Maps, map integration coming soon" />
      </div>
    </>
  );
}
