import type { ReactNode } from "react";
import { EmptyState, Loading } from "@/components/common/states";

export interface TableColumn<T> { key: string; label: string; render: (row: T) => ReactNode; }
export function DataTable<T>({ columns, rows, loading = false, emptyTitle = "No records found" }: { columns: Array<TableColumn<T>>; rows: T[]; loading?: boolean; emptyTitle?: string }) {
  if (loading) return <Loading />;
  if (!rows.length) return <EmptyState title={emptyTitle} description="Results from the connected backend will appear here." />;
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={index} className="hover:bg-slate-50">{columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{column.render(row)}</td>)}</tr>)}</tbody></table></div>;
}
