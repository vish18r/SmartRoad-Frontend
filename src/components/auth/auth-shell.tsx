import type { ReactNode } from "react";
import { BrandLogo } from "@/components/branding/brand-logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <main
      style={{ backgroundImage: "var(--gradient-subtle-radial)" }}
      className="grid min-h-screen place-items-center bg-[var(--background)] p-5"
    >
      <section className="animate-fade-in-up w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <BrandLogo showBusinessType showTagline />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
