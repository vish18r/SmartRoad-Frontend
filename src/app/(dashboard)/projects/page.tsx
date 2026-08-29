"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import { ProjectContractNotice } from "@/components/projects/project-contract-notice";
import { FilterBar } from "@/components/common/filter-bar";

interface ProjectRow { id: string; name: string; }
const columns: Array<TableColumn<ProjectRow>> = [
	{ key: "project", label: "Project", render: (row) => row.name },
	{ key: "client", label: "Client", render: () => "Unavailable" },
	{ key: "location", label: "Location", render: () => "Unavailable" },
	{ key: "progress", label: "Progress", render: () => "Unavailable" },
	{ key: "budget", label: "Budget", render: () => "Unavailable" },
	{ key: "status", label: "Status", render: () => "Unavailable" },
	{ key: "actions", label: "Actions", render: (row) => <Link href={`/projects/${row.id}`} className="font-semibold text-orange-600">View</Link> },
];

export default function ProjectsPage() {
	const [query, setQuery] = useState("");
	return <div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-orange-600">Project control</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Projects and CC roads</h1><p className="mt-1 text-sm text-slate-500">Browse, filter, and manage road construction projects.</p></div><Link href="/projects/new" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">New project</Link></div><div className="mt-7"><ProjectContractNotice /></div><div className="mt-7"><FilterBar onSearch={setQuery} /><div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span>{query ? `Searching for “${query}”` : "No project records loaded"}</span><span>Page 1 · Pagination available when API is connected</span></div><div className="mt-3 hidden md:block"><DataTable columns={columns} rows={[]} emptyTitle="No projects available" /></div><div className="mt-3 md:hidden"><p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Project cards will appear here when the backend API is available.</p></div></div></div>;
}
