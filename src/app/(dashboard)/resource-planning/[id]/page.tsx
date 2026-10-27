"use client";

import { useParams, useRouter } from "next/navigation";
import { resourcePlanApi } from "@/lib/api/resource-plan-api";
import { useApi, useMutation } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import type { ResourceAllocationResponse, ResourcePlanStatus, ResourceType } from "@/types/resource-plan";

const PLAN_STATUS_COLORS: Record<ResourcePlanStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PLANNED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const TYPE_LABELS: Record<ResourceType, string> = {
  WORKER: "Workers",
  MACHINE: "Machines",
  MATERIAL: "Materials",
  VEHICLE: "Vehicles",
};

function AllocationTable({ allocations }: { allocations: ResourceAllocationResponse[] }) {
  if (!allocations.length) return <p className="text-sm text-slate-500">None allocated.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Resource</th>
            <th className="px-3 py-2 font-semibold">Time</th>
            <th className="px-3 py-2 font-semibold">Quantity</th>
            <th className="px-3 py-2 font-semibold">Task</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allocations.map((a) => (
            <tr key={a.id}>
              <td className="px-3 py-2 text-slate-700">{a.resourceLabel}</td>
              <td className="px-3 py-2 text-slate-700">{a.startTime ? `${a.startTime}${a.endTime ? `–${a.endTime}` : ""}` : "—"}</td>
              <td className="px-3 py-2 text-slate-700">{a.plannedQuantity != null ? `${a.plannedQuantity} ${a.unit ?? ""}` : "—"}</td>
              <td className="px-3 py-2 text-slate-700">{a.taskDescription ?? "—"}</td>
              <td className="px-3 py-2 text-slate-700">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResourcePlanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const id = params.id;

  const { data: detail, loading, error, refetch } = useApi(() => resourcePlanApi.get(id), { skip: !id, deps: [id] });

  const { mutate: confirmPlan, loading: confirming } = useMutation(() => resourcePlanApi.confirm(id), {
    onSuccess: () => {
      toast.success("Plan confirmed.");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Could not confirm plan — it may have blocking conflicts."),
  });

  const { mutate: cancelPlan, loading: cancelling } = useMutation(() => resourcePlanApi.cancel(id), {
    onSuccess: () => {
      toast.success("Plan cancelled.");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Could not cancel plan."),
  });

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error.message} />;
  if (!detail) return <EmptyState title="Plan not found" description="This resource plan could not be loaded." />;

  const { plan, allocations } = detail;
  const grouped: Record<ResourceType, ResourceAllocationResponse[]> = {
    WORKER: allocations.filter((a) => a.resourceType === "WORKER"),
    MACHINE: allocations.filter((a) => a.resourceType === "MACHINE"),
    MATERIAL: allocations.filter((a) => a.resourceType === "MATERIAL"),
    VEHICLE: allocations.filter((a) => a.resourceType === "VEHICLE"),
  };

  return (
    <>
      <div className="animate-fade-in-up flex flex-wrap items-start justify-between gap-3">
        <div>
          <button className="text-sm text-orange-600 hover:underline" onClick={() => router.push("/resource-planning")}>
            ← Back to resource planning
          </button>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{plan.planName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {plan.projectName ?? "—"} · {plan.planDate}
            {plan.endDate ? ` – ${plan.endDate}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_STATUS_COLORS[plan.status] ?? "bg-slate-100 text-slate-600"}`}>
            {plan.status.replace(/_/g, " ")}
          </span>
          {(plan.status === "DRAFT" || plan.status === "PLANNED") && (
            <button
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              onClick={() => confirmPlan()}
              disabled={confirming}
            >
              Confirm
            </button>
          )}
          {plan.status !== "CANCELLED" && plan.status !== "COMPLETED" && (
            <button
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              onClick={() => cancelPlan()}
              disabled={cancelling}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supervisor</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{plan.supervisorName ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conflict status</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
            <span className={`h-2 w-2 rounded-full ${plan.hasConflicts ? "bg-red-500" : "bg-green-500"}`} />
            {plan.hasConflicts ? "Conflicts" : "Clear"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created by</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{plan.createdBy ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            W {plan.workersCount} · M {plan.machinesCount} · Mat {plan.materialsCount} · V {plan.vehiclesCount}
          </p>
        </div>
      </div>

      {plan.description && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-slate-700">{plan.description}</p>
        </div>
      )}

      {(["WORKER", "MACHINE", "MATERIAL", "VEHICLE"] as const).map((type) => (
        <section key={type} className="mt-7">
          <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">{TYPE_LABELS[type]}</h2>
          <AllocationTable allocations={grouped[type]} />
        </section>
      ))}
    </>
  );
}
