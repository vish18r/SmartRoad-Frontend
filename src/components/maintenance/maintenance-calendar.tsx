"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { maintenanceApi } from "@/lib/api/maintenance-api";
import { useApi } from "@/hooks/useApi";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import { PriorityBadge, StatusBadge } from "@/components/maintenance/maintenance-ui";
import { MAINTENANCE_STATUS_STYLES, MAINTENANCE_TYPE_LABELS, toIsoDate } from "@/lib/maintenance-format";
import type { MaintenanceRecord } from "@/types/maintenance";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Lightweight month calendar for maintenance (no external calendar library exists in this app):
 * a month grid with per-day counts plus an agenda list grouped by day. Records are grouped by the
 * browser's local day; the request is padded by one day either side so server/browser time-zone
 * differences never drop records at the month edges.
 */
export function MaintenanceCalendar({ organizationId }: { organizationId: string }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const monthStart = month;
  const monthEnd = useMemo(() => new Date(month.getFullYear(), month.getMonth() + 1, 0), [month]);

  const { data, loading, error } = useApi<MaintenanceRecord[]>(
    () =>
      maintenanceApi.getCalendar({
        organizationId,
        startDate: toIsoDate(addDays(monthStart, -1)),
        endDate: toIsoDate(addDays(monthEnd, 1)),
      }),
    { skip: !organizationId, deps: [organizationId, month.getTime()] }
  );

  const byDay = useMemo(() => {
    const groups = new Map<string, MaintenanceRecord[]>();
    for (const record of data ?? []) {
      const key = toIsoDate(new Date(record.scheduledStart));
      const list = groups.get(key) ?? [];
      list.push(record);
      groups.set(key, list);
    }
    return groups;
  }, [data]);

  const cells = useMemo(() => {
    const leading = (monthStart.getDay() + 6) % 7; // Monday-first grid
    const result: (Date | null)[] = Array.from({ length: leading }, () => null);
    for (let d = 1; d <= monthEnd.getDate(); d++) result.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [month, monthStart, monthEnd]);

  const monthKeys = cells.filter((c): c is Date => c !== null).map((c) => toIsoDate(c));
  const agendaDays = (selectedDay ? [selectedDay] : monthKeys).filter((key) => (byDay.get(key) ?? []).length > 0);
  const todayKey = toIsoDate(new Date());

  function shiftMonth(delta: number) {
    setSelectedDay(null);
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
          <h2 className="min-w-40 text-center text-base font-semibold text-slate-900">
            {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </h2>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
        </div>
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => {
            const now = new Date();
            setSelectedDay(null);
            setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
        >
          Today
        </button>
      </div>

      {error ? (
        <ErrorState message={error.message} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-sm)]">
            <div className="grid min-w-[560px] grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid min-w-[560px] grid-cols-7">
              {cells.map((cell, index) => {
                if (!cell) return <div key={`blank-${index}`} className="min-h-20 border-b border-r border-slate-100 bg-slate-50/50" />;
                const key = toIsoDate(cell);
                const items = byDay.get(key) ?? [];
                const selected = selectedDay === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(selected ? null : key)}
                    className={`min-h-20 border-b border-r border-slate-100 p-1.5 text-left align-top transition-colors hover:bg-orange-50 ${selected ? "bg-orange-50 ring-2 ring-inset ring-orange-400" : ""}`}
                  >
                    <span className={`text-xs font-semibold ${key === todayKey ? "rounded-full bg-orange-600 px-1.5 py-0.5 text-white" : "text-slate-600"}`}>{cell.getDate()}</span>
                    <div className="mt-1 space-y-0.5">
                      {items.slice(0, 2).map((r) => (
                        <p key={r.id} className={`truncate rounded px-1 text-[11px] ${MAINTENANCE_STATUS_STYLES[r.status]}`} title={`${r.maintenanceReference} · ${r.title}`}>
                          {r.title}
                        </p>
                      ))}
                      {items.length > 2 && <p className="text-[11px] text-slate-500">+{items.length - 2} more</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              {selectedDay ? `Agenda for ${new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : "Agenda for this month"}
            </h3>
            {agendaDays.length === 0 ? (
              <EmptyState title="Nothing scheduled" description={selectedDay ? "No maintenance is scheduled on this day." : "No maintenance is scheduled in this month."} />
            ) : (
              <div className="space-y-3">
                {agendaDays.map((key) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)]">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short" })}
                    </p>
                    <ul className="divide-y divide-slate-100">
                      {(byDay.get(key) ?? []).map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                          <div className="min-w-0">
                            <Link href={`/maintenance/${r.id}`} className="font-medium text-slate-900 hover:text-orange-600 hover:underline">
                              {r.title}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {r.maintenanceReference} · {r.machineName ?? "Machine"} · {MAINTENANCE_TYPE_LABELS[r.maintenanceType]} ·{" "}
                              {new Date(r.scheduledStart).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={r.priority} />
                            <StatusBadge status={r.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
