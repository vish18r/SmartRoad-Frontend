import type { CSSProperties } from "react";
import { EmptyState } from "./states";
import { PRODUCT_NAME } from "@/constants/branding";

export function ModulePage({ title, description, capabilities = [] }: { title: string; description: string; capabilities?: string[] }) {
	return <div>
		<div className="flex flex-wrap items-start justify-between gap-4 animate-fade-in-up">
			<div>
				<p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{PRODUCT_NAME}</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
				<p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
			</div>
		</div>
		<div className="mt-7 grid gap-4 md:grid-cols-3">
			{(capabilities.length ? capabilities : ["Browse records", "Create and update", "Export reports"]).map((capability, index) => (
				<div
					key={capability}
					className="animate-stagger rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
					style={{ "--stagger": index } as CSSProperties}
				>
					<p className="text-sm font-semibold text-slate-800">{capability}</p>
					<p className="mt-2 text-xs leading-5 text-slate-500">Use this module to {capability.toLowerCase()} for {title.toLowerCase()}.</p>
				</div>
			))}
		</div>
		<div className="mt-7 animate-fade-in-up"><EmptyState title={`No ${title.toLowerCase()} records yet`} description={`Add your first ${title.toLowerCase()} record to get started.`} /></div>
	</div>;
}
