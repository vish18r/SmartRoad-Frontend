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
  const googleLogin = () => { const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, ""); if (backend) window.location.assign(`${backend}/oauth2/authorization/google`); else setError("Google sign-in is not configured."); };
  return <AuthShell title="Welcome back" subtitle="Sign in to manage your construction operations."><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium text-slate-700">Email or phone number<input disabled={loading} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500" /></label><PasswordInput label="Password" value={password} onChange={setPassword} disabled={loading} />{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button></form><div className="mt-4 flex justify-between text-sm"><Link href="/forgot-password" className="text-orange-600">Forgot password?</Link><Link href="/register" className="text-orange-600">Create an account</Link></div><div className="my-5 border-t border-slate-200" /><button type="button" onClick={googleLogin} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>Continue with Google</button></AuthShell>;
}

export default function LoginPageWithSuspense() { return <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</main>}><LoginPage /></Suspense>; }
