export function Loading() {
  return (
    <div className="space-y-2 p-6" role="status" aria-label="Loading">
      <div className="animate-skeleton h-4 w-1/3 rounded" />
      <div className="animate-skeleton h-4 w-2/3 rounded" />
      <div className="animate-skeleton h-4 w-1/2 rounded" />
    </div>
  );
}
export function ErrorState({ message = "Something went wrong." }: { message?: string }) { return <p className="animate-fade-in-up rounded-lg bg-red-50 p-4 text-sm text-red-700">{message}</p>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <section className="animate-fade-in-up rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold text-slate-800">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p>{action && <div className="mt-4 flex justify-center">{action}</div>}</section>; }
