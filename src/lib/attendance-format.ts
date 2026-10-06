// Display helpers for attendance. The backend clock is the source of truth; these only format
// values it returned, and never derive an attendance time from the device clock.

/** Today's date as yyyy-MM-dd in the viewer's timezone, for the date picker default and queries. */
export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "08:42 AM" from a server timestamp, or an em dash when there is none. */
export function formatClock(timestamp?: string): string {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

/** "06 Oct 2026" from a yyyy-MM-dd date. */
export function formatDay(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** "08h 45m" from a number of seconds. */
export function formatWork(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

/** Whole seconds from an "HH:mm:ss" duration returned by the backend. */
export function secondsFromDuration(duration: string): number {
  const [h = 0, m = 0, s = 0] = duration.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export const STATE_LABELS: Record<string, string> = {
  NOT_CHECKED_IN: "Not checked in",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
};

export const STATE_STYLES: Record<string, string> = {
  NOT_CHECKED_IN: "bg-slate-100 text-slate-600",
  CHECKED_IN: "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-blue-100 text-blue-700",
};

export const METHOD_LABELS: Record<string, string> = { QR: "QR", FACE: "Face", MANUAL: "Manual" };
