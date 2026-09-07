"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/auth/auth";
import { BrandLogo } from "@/components/branding/brand-logo";

const items = [
  ["Dashboard", "/dashboard"], ["Owner dashboard", "/owner-dashboard"], ["Site dashboard", "/site-dashboard"], ["Project health", "/project-health"], ["Projects", "/projects"], ["Organizations", "/organizations"], ["Contracts", "/contracts"], ["Clients", "/clients"], ["Sites", "/sites"], ["Resources", "/resource-planning"], ["Road surveys", "/surveys"], ["Road sections", "/sections"], ["Road cutting", "/road-cutting"], ["Concrete work", "/concrete"], ["Workers", "/workers"], ["Attendance", "/attendance"], ["Shifts", "/shifts"], ["Geofence", "/geofence"], ["QR check-in", "/qr-checkin"], ["Payroll", "/payroll"], ["Overtime", "/overtime"], ["Machines", "/machines"], ["Maintenance", "/maintenance"], ["Machine utilization", "/machine-utilization"], ["Materials", "/materials"], ["Stock ledger", "/stock-ledger"], ["Material delivery", "/material-delivery"], ["Fuel", "/fuel"], ["Fuel log", "/fuel-log"], ["Expenses", "/expenses"], ["Daily site diary", "/site-diary"], ["Safety", "/safety"], ["Issues", "/issues"], ["Tasks", "/tasks"], ["Approvals", "/approvals"], ["Budget", "/budget"], ["Profit and loss", "/profitability"], ["Cash flow", "/cash-flow"], ["Receivables", "/receivables"], ["Payables", "/payables"], ["Payments", "/payments"], ["Alerts", "/alerts"], ["Calendar", "/calendar"], ["Reports", "/reports"], ["Activity logs", "/activity-logs"], ["Command center", "/command-center"], ["Insights", "/insights"],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  useEffect(() => { setRole(auth.getUser()?.role || ""); }, []);
  useEffect(() => { const toggle = () => setOpen((value) => !value); window.addEventListener("smartroad:toggle-sidebar", toggle); return () => window.removeEventListener("smartroad:toggle-sidebar", toggle); }, []);
  const visibleItems = role === "WORKER" ? items.filter(([, href]) => ["/dashboard", "/attendance", "/daily-progress", "/calendar", "/payroll", "/payments", "/geofence", "/qr-checkin"].includes(href)) : items;
  return <aside className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-72 flex-col bg-slate-950 px-4 py-6 text-slate-300 shadow-xl md:static md:flex md:w-64 md:shadow-none`}><div className="mb-8 px-3 space-y-2"><BrandLogo href="/dashboard" compact darkSurface /><p className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:block">Developers & Civil Contractor</p></div><nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Main navigation">{visibleItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${pathname === href ? "bg-orange-500 text-white" : "hover:bg-slate-800 hover:text-white"}`}>{label}</Link>)}</nav><div className="mt-4 border-t border-slate-800 pt-4"><Link href="/profile" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white">Profile</Link><Link href="/settings" className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white">Settings</Link></div></aside>;
}
