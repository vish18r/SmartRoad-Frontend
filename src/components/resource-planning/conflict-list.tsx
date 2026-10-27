import type { ResourceConflict } from "@/types/resource-plan";

export function ConflictList({ conflicts }: { conflicts: ResourceConflict[] }) {
  if (!conflicts.length) {
    return <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">No conflicts found.</p>;
  }
  return (
    <div className="space-y-2">
      {conflicts.map((c, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 text-sm ${
            c.severity === "BLOCKING" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"
          }`}
        >
          <p className={`font-semibold ${c.severity === "BLOCKING" ? "text-red-800" : "text-amber-800"}`}>
            {c.resourceLabel} — {c.severity === "BLOCKING" ? "Blocking" : "Warning"}
          </p>
          <p className="mt-0.5 text-slate-700">{c.message}</p>
          {(c.conflictingPlanName || c.conflictingProjectName || c.date) && (
            <p className="mt-1 text-xs text-slate-500">
              {c.conflictingPlanName && <>Plan: {c.conflictingPlanName} </>}
              {c.conflictingProjectName && <>· Project: {c.conflictingProjectName} </>}
              {c.date && <>· Date: {c.date}</>}
              {c.startTime && <> {c.startTime}{c.endTime ? `–${c.endTime}` : ""}</>}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
