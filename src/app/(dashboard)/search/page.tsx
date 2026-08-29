"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/states";
function SearchResults() { const query = useSearchParams().get("q") || ""; return <div><p className="text-sm font-medium text-orange-600">Workspace search</p><h1 className="mt-1 text-3xl font-bold">Search results</h1><p className="mt-1 text-sm text-slate-500">{query ? `Results for “${query}”` : "Search projects, workers, machines, materials, and expenses."}</p><div className="mt-7"><EmptyState title="Search integration pending" description="The backend currently has no searchable business-module endpoints." /></div></div>; }
export default function SearchPage() { return <Suspense fallback={<p className="text-sm text-slate-500">Searching...</p>}><SearchResults /></Suspense>; }
