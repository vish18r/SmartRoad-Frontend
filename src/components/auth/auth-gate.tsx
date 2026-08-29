"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  useEffect(() => { let active = true; const restore = async () => { const user = await auth.restoreSession(); if (!active) return; if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`); else setReady(true); }; void restore(); const unauthorized = () => router.replace("/login"); window.addEventListener("smartroad:unauthorized", unauthorized); return () => { active = false; window.removeEventListener("smartroad:unauthorized", unauthorized); }; }, [pathname, router]);
  if (!ready) return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Restoring your session…</main>;
  return <>{children}</>;
}
