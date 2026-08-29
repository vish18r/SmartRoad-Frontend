export function Loading() { return <p className="p-6 text-sm text-slate-500">Loading…</p>; }
export function ErrorState({ message = "Something went wrong." }: { message?: string }) { return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{message}</p>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold text-slate-800">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></section>; }
