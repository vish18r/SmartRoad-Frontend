"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const actions = [
  ["Create project", "/projects"], ["Add worker", "/workers"], ["Add expense", "/expenses"], ["Add material", "/materials"], ["Mark attendance", "/attendance"], ["Add daily progress", "/daily-progress"], ["Search project", "/search"],
] as const;

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen((value) => !value); } if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-20 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg">Command menu <kbd className="ml-2 rounded border border-slate-600 px-1.5 py-0.5 text-xs">Ctrl K</kbd></button>;
  return <div className="fixed inset-0 z-40 grid place-items-start bg-slate-950/40 p-5 pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command menu" onClick={() => setOpen(false)}><div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="border-b border-slate-100 px-3 pb-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick actions</p><p className="mt-1 text-sm text-slate-700">Choose a workspace to continue.</p></div><div className="mt-2 grid gap-1">{actions.map(([label, href]) => <button key={href} type="button" onClick={() => { setOpen(false); router.push(href); }} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700">{label}</button>)}</div></div></div>;
}
