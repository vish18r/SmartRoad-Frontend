import type { ReactNode } from "react";
import { BrandLogo } from "@/components/branding/brand-logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><BrandLogo /><h1 className="mt-3 text-2xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p>{children}</section></main>;
}
