"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { authApi } from "@/lib/api/auth-api";
import { auth } from "@/lib/auth/auth";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

function LoginPage() {
  const router = useRouter(), params = useSearchParams(); const [identifier, setIdentifier] = useState(""), [password, setPassword] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!identifier.trim() || !password) return setError("Email or phone number and password are required."); setLoading(true); setError(""); try { const session = await authApi.login({ identifier: identifier.trim(), password }); auth.setSession(session); const user = await auth.restoreSession(); if (!user) throw { status: 401, message: "Your session could not be restored." } satisfies ApiError; router.replace(params.get("next") || "/dashboard"); } catch (reason) { setError((reason as ApiError).message || "Unable to sign in."); } finally { setLoading(false); } };
  const googleLogin = () => { const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, ""); if (backend) window.location.assign(`${backend}/oauth2/authorize/google`); else setError("Google sign-in is not configured."); };
  return <AuthShell title="Welcome back" subtitle="Sign in to manage your construction operations."><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700">Email or phone number<input disabled={loading} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500" /></label><PasswordInput label="Password" value={password} onChange={setPassword} disabled={loading} />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button></form><div className="mt-4 flex justify-between text-sm"><Link href="/forgot-password" className="text-orange-600">Forgot password?</Link><Link href="/register" className="text-orange-600">Create an account</Link></div><div className="my-5 border-t border-slate-200" /><button type="button" onClick={googleLogin} className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium">Continue with Google</button></AuthShell>;
}

export default function LoginPageWithSuspense() { return <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</main>}><LoginPage /></Suspense>; }
