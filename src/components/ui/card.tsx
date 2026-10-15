interface CardProps { title: string; value: string; detail?: string; stagger?: number; }
export function Card({ title, value, detail, stagger = 0 }: CardProps) {
  return (
    <article
      style={{ "--stagger": stagger } as React.CSSProperties}
      className="animate-stagger rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {detail && <p className="mt-2 text-sm text-emerald-600">{detail}</p>}
    </article>
  );
}
