"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ProjectContractNotice } from "@/components/projects/project-contract-notice";

export default function EditProjectPage() { const { id } = useParams<{ id: string }>(); return <div className="max-w-3xl"><p className="text-sm font-medium text-orange-600">Project control</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Edit project {id}</h1><p className="mt-1 text-sm text-slate-500">Existing project data and editable fields will be loaded from the backend DTO.</p><div className="mt-7"><ProjectContractNotice /></div><section className="mt-6 rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Edit form unavailable</h2><p className="mt-2 text-sm leading-6 text-slate-500">Update controls remain disabled because the backend has no project update endpoint or request contract.</p><div className="mt-5 flex gap-3"><Link href={`/projects/${id}`} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Cancel</Link><button type="button" disabled className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-400">Save unavailable</button></div></section></div>; }
