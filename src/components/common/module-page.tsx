import { EmptyState } from "./states";
import { PRODUCT_NAME } from "@/constants/branding";

export function ModulePage({ title, description, capabilities = [] }: { title: string; description: string; capabilities?: string[] }) {
	return <div>
		<div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{PRODUCT_NAME}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Backend integration pending</span></div>
		<div className="mt-7 grid gap-4 md:grid-cols-3">{(capabilities.length ? capabilities : ["Browse records", "Create and update", "Export reports"]).map((capability) => <div key={capability} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-800">{capability}</p><p className="mt-2 text-xs leading-5 text-slate-500">Available when the corresponding Spring Boot endpoint is added.</p></div>)}</div>
		<div className="mt-7"><EmptyState title={`No ${title.toLowerCase()} data yet`} description="This interface is ready for the backend contract. No sample records are shown." /></div>
	</div>;
}
