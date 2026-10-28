"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/lib/auth/auth";
import { tokenStorage } from "@/lib/auth/token";

export const dynamic = "force-dynamic";

function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);

    auth
      .restoreSession()
      .then((user) => {
        if (!user) throw new Error("Session could not be restored.");
        router.replace("/dashboard");
      })
      .catch(() => {
        tokenStorage.clear();
        setError("Google sign-in failed. Please try again.");
      });
  }, [params, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-red-600">
        {error}
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center text-sm text-slate-500">
      Signing you in…
    </main>
  );
}

export default function OAuthCallbackPageWithSuspense() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</main>}>
      <OAuthCallbackPage />
    </Suspense>
  );
}
