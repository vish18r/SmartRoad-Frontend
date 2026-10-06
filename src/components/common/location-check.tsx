"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api/api-client";
import { workersApi } from "@/lib/api/workers-api";
import type { WorkerResponse } from "@/types/worker";
import { useWorkspace } from "@/components/workspace/workspace-context";
import type { ApiError } from "@/types/api";

interface CheckinRecord {
  id: string;
  workerId: string;
  checkInTime?: string;
  checkOutTime?: string;
  durationMinutes?: number;
  status: string;
}

const TRACKING = "/nextenti/tracking";

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
}

interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  displayName?: string;
}

// Reverse-geocodes through OpenStreetMap Nominatim; the coordinates are sent to that service.
async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<CapturedLocation>> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=16&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
  const data = await response.json();
  const a = data.address ?? {};
  return {
    area: a.suburb || a.neighbourhood || a.quarter || a.village || a.hamlet || a.road,
    city: a.city || a.town || a.municipality || a.city_district || a.county,
    state: a.state,
    country: a.country,
    displayName: data.display_name,
  };
}

const GEO_ERRORS: Record<number, string> = {
  1: "Location permission was denied. Allow location access for this site in the browser address bar and try again.",
  2: "Your position is unavailable right now. Check that device location services are on.",
  3: "Getting your location timed out. Try again.",
};

export function LocationCheck() {
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { organizationId, projectId } = useWorkspace();
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const loadCheckins = useCallback(() => {
    if (!projectId) { setRecords([]); return; }
    apiClient.get<CheckinRecord[]>(`${TRACKING}/checkins?projectId=${projectId}`)
      .then(setRecords)
      .catch(() => setRecords([]));
  }, [projectId]);

  useEffect(loadCheckins, [loadCheckins]);

  useEffect(() => {
    if (!organizationId) { setWorkers([]); return; }
    workersApi.list(organizationId).then(setWorkers).catch(() => setWorkers([]));
  }, [organizationId]);

  const send = async (action: "checkin" | "checkout") => {
    if (!projectId || !location) return;
    if (!workerId) { setNotice({ type: "error", text: "Select the worker first." }); return; }
    setSaving(true); setNotice(null);
    try {
      await apiClient.post(`${TRACKING}/${action}`, {
        projectId,
        workerId,
        method: "MANUAL",
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      });
      setNotice({ type: "ok", text: action === "checkin" ? "Checked in." : "Checked out." });
      loadCheckins();
    } catch (err) {
      setNotice({ type: "error", text: (err as ApiError).message || "Request failed." });
    } finally {
      setSaving(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }
    setLoading(true);
    setLocation(null);
    setMessage("Requesting current location...");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const captured: CapturedLocation = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy };
        setLocation(captured);
        setMessage("Looking up city and area...");
        try {
          setLocation({ ...captured, ...(await reverseGeocode(coords.latitude, coords.longitude)) });
          setMessage("");
        } catch {
          setMessage("Coordinates captured, but the city and area could not be looked up.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage(GEO_ERRORS[error.code] ?? "Unable to capture your location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const rows: [string, string | undefined][] = location
    ? [
        ["Area", location.area],
        ["City", location.city],
        ["State", location.state],
        ["Country", location.country],
        ["Coordinates", `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (±${Math.round(location.accuracy)} m)`],
      ]
    : [];

  return (
    <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">Geofenced attendance</h2>
      <p className="mt-2 text-sm text-slate-500">Capture your current location, then check in or out on the selected project.</p>
      <button type="button" onClick={locate} disabled={loading} className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {loading ? "Capturing..." : "Capture current location"}
      </button>
      {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
      {location && (
        <dl className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          {rows.filter(([, value]) => value).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-3 py-2">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {location && (
        <div className="mt-4">
          {!projectId && <p className="mb-2 text-sm text-amber-700">Select a project in the top bar to check in or out.</p>}
          <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} aria-label="Worker" className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
            <option value="">Select worker</option>
            {workers.map(w => <option key={w.id} value={w.id}>{w.employeeId} — {w.fullName}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="button" onClick={() => send("checkin")} disabled={saving || !projectId} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Check in here</button>
            <button type="button" onClick={() => send("checkout")} disabled={saving || !projectId} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Check out</button>
          </div>
        </div>
      )}
      {notice && <p role="status" className={`mt-3 text-sm ${notice.type === "ok" ? "text-green-700" : "text-red-600"}`}>{notice.text}</p>}
      {projectId && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-900">Today&apos;s check-ins</h3>
          {records.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No check-ins recorded for this project today.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-1">In</th><th>Out</th><th>Duration</th><th>Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="py-1.5">{formatTime(r.checkInTime)}</td>
                    <td>{formatTime(r.checkOutTime)}</td>
                    <td>{r.durationMinutes != null ? `${r.durationMinutes} min` : "—"}</td>
                    <td className="capitalize">{r.status.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
