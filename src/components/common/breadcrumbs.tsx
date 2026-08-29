"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() { const pathname = usePathname(); const segments = pathname.split("/").filter(Boolean); return <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link href="/dashboard" className="hover:text-orange-600">Workspace</Link>{segments.map((segment, index) => <span key={segment} className="flex items-center gap-2"><span aria-hidden="true">/</span><span className={index === segments.length - 1 ? "font-semibold text-slate-700" : "capitalize"}>{segment.replaceAll("-", " ")}</span></span>)}</nav>; }
