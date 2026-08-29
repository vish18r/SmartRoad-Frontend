"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (pathname === "/login" || pathname === "/register") { void auth.restoreSession().then((user) => { if (user) router.replace("/dashboard"); }); } }, [pathname, router]);
  return <>{children}</>;
}
