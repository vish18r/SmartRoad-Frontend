"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resourcePlanApi } from "@/lib/api/resource-plan-api";
import { workersApi } from "@/lib/api/workers-api";
import { machineApi } from "@/lib/api/machine-api";
import { vehicleApi } from "@/lib/api/vehicle-api";
import { materialApi } from "@/lib/api/material-api";
import { projectApi } from "@/lib/api/project-api";
import { useApi, useMutation } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { EmptyState, ErrorState, Loading } from "@/components/common/states";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { ConflictList } from "@/components/resource-planning/conflict-list";
import type { ApiError } from "@/types/api";
import type { WorkerResponse } from "@/types/worker";
import type { MaterialResponse } from "@/types/material";
import type {
  ResourcePlanResponse,
  ResourcePlanStatus,
  ResourceAllocationRequest,
  ResourceConflict,
} from "@/types/resource-plan";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] hover:shadow-[var(--shadow-md)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-700" aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-[box-shadow,border-color] duration-[var(--transition-fast)] focus:outline-none focus:border-transparent focus:shadow-[var(--focus-ring)]";

const PLAN_STATUS_COLORS: Record<ResourcePlanStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PLANNED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

type DraftAllocation = ResourceAllocationRequest & { _key: string; _label: string };

function toAllocationRequest(a: DraftAllocation): ResourceAllocationRequest {
  return {
    resourceType: a.resourceType,
    resourceId: a.resourceId,
    startTime: a.startTime,
    endTime: a.endTime,
    allocationStartDate: a.allocationStartDate,
    allocationEndDate: a.allocationEndDate,
    plannedQuantity: a.plannedQuantity,
    unit: a.unit,
    assignedWorkerId: a.assignedWorkerId,
    taskDescription: a.taskDescription,
    notes: a.notes,
  };
}

const STEP_LABELS = ["Plan Details", "Workers", "Machines", "Materials", "Vehicles", "Review"];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
        Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}
      </p>
      <div className="mt-2 flex gap-1.5 motion-reduce:transition-none">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-[var(--transition-fast)] motion-reduce:transition-none ${
              i <= step ? "bg-orange-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CreatePlanWizard({
  organizationId,
  projectId,
  projectName,
  onClose,
  onCreated,
}: {
  organizationId: string;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);

  // Step 1 — plan details
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");
  const [supervisorWorkerId, setSupervisorWorkerId] = useState("");
  const [description, setDescription] = useState("");

  // Allocations across steps 2-5
  const [allocations, setAllocations] = useState<DraftAllocation[]>([]);

  const { data: workers, loading: workersLoading } = useApi<WorkerResponse[]>(
    () => workersApi.list(organizationId),
    { skip: !organizationId }
  );
  const { data: machinePage, loading: machinesLoading } = useApi(
    () => machineApi.list({ organizationId }),
    { skip: !organizationId }
  );
  const { data: vehiclePage, loading: vehiclesLoading } = useApi(
    () => vehicleApi.list({ organizationId }),
    { skip: !organizationId }
  );
  const { data: materials, loading: materialsLoading } = useApi<MaterialResponse[]>(
    () => materialApi.getList(projectId),
    { skip: !projectId }
  );

  const machines = machinePage?.items ?? [];
  const vehicles = vehiclePage?.items ?? [];

  const [validation, setValidation] = useState<{ conflicts: ResourceConflict[]; hasBlockingConflicts: boolean } | null>(null);
  const { mutate: runValidate, loading: validating } = useMutation(
    () =>
      resourcePlanApi.validate({
        projectId,
        planDate,
        allocations: allocations.map((a) => toAllocationRequest(a)),
      }),
    {
      onSuccess: (res) => setValidation(res),
      onError: (err) => toast.error(err.message || "Validation failed."),
    }
  );

  const [saving, setSaving] = useState(false);

  function addAllocation(a: DraftAllocation) {
    setAllocations((prev) => [...prev, a]);
  }
  function removeAllocation(key: string) {
    setAllocations((prev) => prev.filter((a) => a._key !== key));
  }

  async function persistPlan(confirm: boolean) {
    if (!planName.trim()) {
      toast.error("Plan name is required.");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const plan = await resourcePlanApi.create({
        organizationId,
        projectId,
        planName,
        planDate,
        endDate: endDate || undefined,
        supervisorWorkerId: supervisorWorkerId || undefined,
        description: description || undefined,
      });

      for (const a of allocations) {
        await resourcePlanApi.addAllocation(plan.id, toAllocationRequest(a));
      }

      if (confirm) {
        try {
          await resourcePlanApi.confirm(plan.id);
          toast.success("Resource plan confirmed.");
        } catch (err) {
          const apiError = err as ApiError;
          // The backend returns 409 with a conflicts body when blocking conflicts remain;
          // this app's apiClient does not currently surface that structured body on error
          // (ApiError only carries status/message/errors), so we fall back to the message
          // and leave the plan saved as a draft rather than guessing at its shape.
          toast.error(apiError.message || "Could not confirm plan — it has blocking conflicts. Saved as draft instead.");
        }
      } else {
        toast.success("Resource plan saved as draft.");
      }
      onCreated();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Could not save resource plan.");
    } finally {
      setSaving(false);
    }
  }

  const grouped = useMemo(
    () => ({
      WORKER: allocations.filter((a) => a.resourceType === "WORKER"),
      MACHINE: allocations.filter((a) => a.resourceType === "MACHINE"),
      MATERIAL: allocations.filter((a) => a.resourceType === "MATERIAL"),
      VEHICLE: allocations.filter((a) => a.resourceType === "VEHICLE"),
    }),
    [allocations]
  );

  return (
    <Modal title="Create resource plan" onClose={onClose} wide>
      <StepIndicator step={step} />

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Project</label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Planning for: <span className="font-semibold">{projectName}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Plan name</label>
            <input className={inputClass} value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Daily plan — Oct 27" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Planning date</label>
              <input type="date" className={inputClass} value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">End date (optional, for a range)</label>
              <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Supervisor</label>
            <select className={inputClass} value={supervisorWorkerId} onChange={(e) => setSupervisorWorkerId(e.target.value)} disabled={workersLoading}>
              <option value="">None</option>
              {(workers ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.employeeId} — {w.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <textarea rows={2} className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
      )}

      {step === 1 && (
        <AllocationStep
          resourceType="WORKER"
          loading={workersLoading}
          options={(workers ?? []).map((w) => ({ id: w.id, label: `${w.employeeId} — ${w.fullName}` }))}
          planDate={planDate}
          added={grouped.WORKER}
          onAdd={addAllocation}
          onRemove={removeAllocation}
        />
      )}

      {step === 2 && (
        <AllocationStep
          resourceType="MACHINE"
          loading={machinesLoading}
          options={machines.map((m) => ({ id: m.id, label: `${m.name}${m.registrationNumber ? ` (${m.registrationNumber})` : ""}` }))}
          planDate={planDate}
          added={grouped.MACHINE}
          onAdd={addAllocation}
          onRemove={removeAllocation}
          workers={workers ?? []}
          operatorLabel="Operator"
        />
      )}

      {step === 3 && (
        <MaterialAllocationStep
          loading={materialsLoading}
          materials={materials ?? []}
          planDate={planDate}
          added={grouped.MATERIAL}
          onAdd={addAllocation}
          onRemove={removeAllocation}
        />
      )}

      {step === 4 && (
        <AllocationStep
          resourceType="VEHICLE"
          loading={vehiclesLoading}
          options={vehicles.map((v) => ({ id: v.id, label: `${v.registrationNumber}${v.vehicleType ? ` (${v.vehicleType})` : ""}` }))}
          planDate={planDate}
          added={grouped.VEHICLE}
          onAdd={addAllocation}
          onRemove={removeAllocation}
          workers={workers ?? []}
          operatorLabel="Driver"
        />
      )}

      {step === 5 && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Allocations</h3>
            {allocations.length === 0 ? (
              <p className="text-sm text-slate-500">No resources added yet. Go back to add workers, machines, materials, or vehicles.</p>
            ) : (
              <div className="space-y-3">
                {(["WORKER", "MACHINE", "MATERIAL", "VEHICLE"] as const).map((type) =>
                  grouped[type].length ? (
                    <div key={type}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{type}</p>
                      <ul className="space-y-1">
                        {grouped[type].map((a) => (
                          <li key={a._key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                            <span>{a._label}</span>
                            <button className="text-xs text-red-600 hover:underline" onClick={() => removeAllocation(a._key)}>Remove</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>

          <div>
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              onClick={() => runValidate()}
              disabled={validating || allocations.length === 0}
            >
              {validating ? "Validating..." : "Validate plan"}
            </button>
            {validation && (
              <div className="mt-3">
                <ConflictList conflicts={validation.conflicts} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </button>
        {step < STEP_LABELS.length - 1 ? (
          <button
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            onClick={() => setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
          >
            Next
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              onClick={() => persistPlan(false)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              onClick={() => persistPlan(true)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Confirm Plan"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AllocationStep({
  resourceType,
  loading,
  options,
  planDate,
  added,
  onAdd,
  onRemove,
  workers,
  operatorLabel,
}: {
  resourceType: "WORKER" | "MACHINE" | "VEHICLE";
  loading: boolean;
  options: { id: string; label: string }[];
  planDate: string;
  added: DraftAllocation[];
  onAdd: (a: DraftAllocation) => void;
  onRemove: (key: string) => void;
  workers?: WorkerResponse[];
  operatorLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedWorkerId, setAssignedWorkerId] = useState("");

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    if (!resourceId) return;
    const option = options.find((o) => o.id === resourceId);
    onAdd({
      _key: `${resourceType}-${resourceId}-${Date.now()}`,
      _label: option?.label ?? resourceId,
      resourceType,
      resourceId,
      allocationStartDate: planDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      taskDescription: taskDescription || undefined,
      assignedWorkerId: assignedWorkerId || undefined,
    });
    setResourceId("");
    setStartTime("");
    setEndTime("");
    setTaskDescription("");
    setAssignedWorkerId("");
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <input className={inputClass} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Select resource</label>
          <select className={inputClass} value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
            <option value="">Select...</option>
            {filtered.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Start time</label>
          <input type="time" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">End time</label>
          <input type="time" className={inputClass} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {resourceType !== "WORKER" && workers && (
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">{operatorLabel ?? "Operator"} (optional)</label>
            <select className={inputClass} value={assignedWorkerId} onChange={(e) => setAssignedWorkerId(e.target.value)}>
              <option value="">None</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.employeeId} — {w.fullName}</option>
              ))}
            </select>
          </div>
        )}
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Task description</label>
          <input className={inputClass} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
        </div>
      </div>
      <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40" onClick={handleAdd} disabled={!resourceId}>
        Add
      </button>

      {added.length > 0 && (
        <ul className="space-y-1 border-t border-slate-100 pt-3">
          {added.map((a) => (
            <li key={a._key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
              <span>{a._label}{a.startTime ? ` · ${a.startTime}${a.endTime ? `–${a.endTime}` : ""}` : ""}</span>
              <button className="text-xs text-red-600 hover:underline" onClick={() => onRemove(a._key)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MaterialAllocationStep({
  loading,
  materials,
  planDate,
  added,
  onAdd,
  onRemove,
}: {
  loading: boolean;
  materials: MaterialResponse[];
  planDate: string;
  added: DraftAllocation[];
  onAdd: (a: DraftAllocation) => void;
  onRemove: (key: string) => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const selected = materials.find((m) => m.id === materialId);

  function handleAdd() {
    if (!materialId) return;
    onAdd({
      _key: `MATERIAL-${materialId}-${Date.now()}`,
      _label: `${selected?.materialName ?? materialId}${quantity ? ` — ${quantity} ${unit || selected?.unit || ""}` : ""}`,
      resourceType: "MATERIAL",
      resourceId: materialId,
      allocationStartDate: planDate,
      plannedQuantity: quantity ? Number(quantity) : undefined,
      unit: unit || selected?.unit,
    });
    setMaterialId("");
    setQuantity("");
    setUnit("");
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Material</label>
        <select
          className={inputClass}
          value={materialId}
          onChange={(e) => {
            setMaterialId(e.target.value);
            const m = materials.find((mm) => mm.id === e.target.value);
            setUnit(m?.unit ?? "");
          }}
        >
          <option value="">Select...</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.materialCode} — {m.materialName}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Planned quantity</label>
          <input type="number" min="0" step="0.01" className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Unit</label>
          <input className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
      </div>
      <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40" onClick={handleAdd} disabled={!materialId}>
        Add
      </button>

      {added.length > 0 && (
        <ul className="space-y-1 border-t border-slate-100 pt-3">
          {added.map((a) => (
            <li key={a._key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
              <span>{a._label}</span>
              <button className="text-xs text-red-600 hover:underline" onClick={() => onRemove(a._key)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResourcePlanningPage() {
  const router = useRouter();
  const toast = useToast();
  const { organizationId, projectId } = useWorkspace();

  const [dateFrom, setDateFrom] = useState(todayIso());
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<ResourcePlanStatus | "">("");
  const [search, setSearch] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  const { data: currentProject } = useApi(
    () => projectApi.getById(projectId as string),
    { skip: !projectId, deps: [projectId] }
  );
  const projectName = currentProject?.name ?? "this project";

  const {
    data: planPage,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useApi(
    () =>
      resourcePlanApi.list({
        organizationId: organizationId as string,
        projectId: projectId as string,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: status || undefined,
        limit: 100,
      }),
    { skip: !organizationId || !projectId, deps: [organizationId, projectId, dateFrom, dateTo, status] }
  );

  const { data: summary } = useApi(
    () =>
      resourcePlanApi.getSummary({
        organizationId: organizationId as string,
        projectId: projectId as string,
        date: dateFrom || undefined,
      }),
    { skip: !organizationId || !projectId, deps: [organizationId, projectId, dateFrom] }
  );

  const { mutate: confirmPlan } = useMutation((id: string) => resourcePlanApi.confirm(id), {
    onSuccess: () => {
      toast.success("Plan confirmed.");
      refetchPlans();
    },
    onError: (err) => toast.error(err.message || "Could not confirm plan — it may have blocking conflicts."),
  });

  const { mutate: cancelPlan } = useMutation((id: string) => resourcePlanApi.cancel(id), {
    onSuccess: () => {
      toast.success("Plan cancelled.");
      refetchPlans();
    },
    onError: (err) => toast.error(err.message || "Could not cancel plan."),
  });

  const plans = planPage?.items ?? [];
  const filteredPlans = search
    ? plans.filter((p) => p.planName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    : plans;

  const columns: TableColumn<ResourcePlanResponse>[] = [
    {
      key: "planName",
      label: "Plan Reference",
      render: (p) => (
        <div>
          <p className="font-medium text-slate-900">{p.planName}</p>
          <p className="text-xs text-slate-400">#{p.id.slice(0, 8)}</p>
        </div>
      ),
    },
    { key: "project", label: "Project / Site", render: (p) => p.projectName ?? "—" },
    { key: "date", label: "Planning Date", render: (p) => p.planDate },
    {
      key: "resources",
      label: "Resource Summary",
      render: (p) => (
        <div className="flex gap-1 text-xs">
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">W {p.workersCount}</span>
          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-purple-700">M {p.machinesCount}</span>
          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">Mat {p.materialsCount}</span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">V {p.vehiclesCount}</span>
        </div>
      ),
    },
    {
      key: "conflicts",
      label: "Conflict Status",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span className={`h-2 w-2 rounded-full ${p.hasConflicts ? "bg-red-500" : "bg-green-500"}`} />
          {p.hasConflicts ? "Conflicts" : "Clear"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Plan Status",
      render: (p) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_STATUS_COLORS[p.status] ?? "bg-slate-100 text-slate-600"}`}>
          {p.status.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "createdBy", label: "Created By", render: (p) => p.createdBy ?? "—" },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="text-orange-600 hover:underline" onClick={() => router.push(`/resource-planning/${p.id}`)}>View</button>
          {(p.status === "DRAFT" || p.status === "PLANNED") && (
            <button className="text-green-700 hover:underline" onClick={() => confirmPlan(p.id)}>Confirm</button>
          )}
          {p.status !== "CANCELLED" && p.status !== "COMPLETED" && (
            <button className="text-red-600 hover:underline" onClick={() => cancelPlan(p.id)}>Cancel</button>
          )}
        </div>
      ),
    },
  ];

  if (!organizationId || !projectId) {
    return (
      <>
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Resource planning</h1>
          <p className="mt-1 text-sm text-slate-500">Plan workers, machines, materials, and vehicles by project and date.</p>
        </div>
        <div className="mt-6">
          <EmptyState
            title="Select a project to continue"
            description="Pick an organization and project from the workspace selector above to view or create resource plans."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="animate-fade-in-up flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-orange-600">Smart Road</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Resource planning</h1>
          <p className="mt-1 text-sm text-slate-500">Plan workers, machines, materials, and vehicles by project and date.</p>
        </div>
        <button
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          onClick={() => setShowWizard(true)}
        >
          Create Resource Plan
        </button>
      </div>

      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total Resource Plans" value={String(summary.totalPlans)} />
          <Stat label="Workers Planned" value={String(summary.workersPlanned)} />
          <Stat label="Machines Allocated" value={String(summary.machinesAllocated)} />
          <Stat label="Vehicles Allocated" value={String(summary.vehiclesAllocated)} />
          <Stat label="Materials Planned" value={String(summary.materialsPlanned)} />
          <Stat label="Plans With Conflicts" value={String(summary.plansWithConflicts)} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Date from</label>
          <input type="date" className={inputClass} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Date to (optional range)</label>
          <input type="date" className={inputClass} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as ResourcePlanStatus | "")}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PLANNED">Planned</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="w-64">
          <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
          <input className={inputClass} placeholder="Search plan name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        {plansError ? (
          <ErrorState message={plansError.message} />
        ) : !plansLoading && plans.length === 0 ? (
          <EmptyState
            title="No resource plans"
            description="Create daily resource plans to assign workers, machines, materials, and vehicles to projects. Daily resource plan, project assignments, conflict detection."
            action={
              <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700" onClick={() => setShowWizard(true)}>
                Create Resource Plan
              </button>
            }
          />
        ) : (
          <DataTable columns={columns} rows={filteredPlans} loading={plansLoading} emptyTitle="No resource plans match your filters" />
        )}
      </div>

      {showWizard && (
        <CreatePlanWizard
          organizationId={organizationId}
          projectId={projectId}
          projectName={projectName}
          onClose={() => setShowWizard(false)}
          onCreated={() => {
            refetchPlans();
          }}
        />
      )}
    </>
  );
}
