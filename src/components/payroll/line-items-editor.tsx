"use client";

// Shared add/remove editor for a payroll's allowance or deduction lines, used by both the
// create/calculate form and the DRAFT edit form on the payroll details page. Editing these rows
// never computes a total on the client — every change is re-sent to the backend's calculate
// endpoint before anything is saved.

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

export interface LineItem<T extends string> {
  key: string;
  type: T;
  description: string;
  amount: string;
}

let nextKey = 0;

/** A key unique within this page load, for React list identity on a newly added row. */
export function newLineItemKey(): string {
  nextKey += 1;
  return `line-${nextKey}`;
}

export function LineItemsEditor<T extends string>({ title, items, setItems, typeLabels, defaultType }: {
  title: string;
  items: LineItem<T>[];
  setItems: (updater: (prev: LineItem<T>[]) => LineItem<T>[]) => void;
  typeLabels: Record<string, string>;
  defaultType: T;
}) {
  function addRow() {
    setItems((prev) => [...prev, { key: newLineItemKey(), type: defaultType, description: "", amount: "" }]);
  }
  function removeRow(key: string) {
    setItems((prev) => prev.filter((row) => row.key !== key));
  }
  function updateRow(key: string, patch: Partial<LineItem<T>>) {
    setItems((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <button type="button" onClick={addRow} className="text-xs font-semibold text-orange-600 hover:underline">+ Add line</button>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">No {title.toLowerCase()} added.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((row) => (
            <div key={row.key} className="grid grid-cols-12 gap-2">
              <select value={row.type} onChange={(e) => updateRow(row.key, { type: e.target.value as T })} className={`${INPUT} col-span-4`}>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input placeholder="Description" value={row.description} onChange={(e) => updateRow(row.key, { description: e.target.value })} className={`${INPUT} col-span-4`} />
              <input type="number" min="0" step="0.01" placeholder="Amount" value={row.amount} onChange={(e) => updateRow(row.key, { amount: e.target.value })} className={`${INPUT} col-span-3`} />
              <button type="button" onClick={() => removeRow(row.key)} className="col-span-1 text-xs font-medium text-red-600 hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
