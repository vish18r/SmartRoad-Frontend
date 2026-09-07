"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { authApi } from "@/lib/api/auth-api";
import type { ApiError } from "@/types/api";
import type { OtpFlow } from "@/types/auth";

export const dynamic = "force-dynamic";
const validFlows: OtpFlow[] = ["SIGNUP_VERIFICATION", "EMAIL_VERIFICATION", "PASSWORD_RESET"];

function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const phoneNumber = params.get("phoneNumber") || "";
  const flow = params.get("flow") as OtpFlow;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds) {
      const id = window.setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => window.clearTimeout(id);
    }
  }, [seconds]);

  const otp = digits.join("");
  const identifier = email || phoneNumber;

  const setDigit = (index: number, value: string) => {
    const values = [...digits];
    values[index] = value.replace(/\D/g, "").slice(-1);
    setDigits(values);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !validFlows.includes(flow) || otp.length !== 6) {
      return setError("Enter all six OTP digits.");
    }

    setLoading(true);
    setError("");

    try {
      if (flow === "PASSWORD_RESET") {
        sessionStorage.setItem("smartroad_reset_context", JSON.stringify({ email, otp }));
        router.push("/reset-password");
        return;
      }

      await authApi.verifyOtp({
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        otp,
        flow,
      });
      router.replace("/login");
    } catch (reason) {
      setError((reason as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setError("");

    try {
      await authApi.resendOtp({
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        flow,
      });
      setSeconds(60);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } catch (reason) {
      setError((reason as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  if (!identifier || !validFlows.includes(flow)) {
    return (
      <AuthShell
        title="Invalid verification link"
        subtitle="Start the verification flow again."
      />
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${identifier}.`}
    >
      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="flex justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={digit}
              disabled={loading}
              onChange={(e) => setDigit(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit && index) {
                  refs.current[index - 1]?.focus();
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 6);
                if (pasted) {
                  e.preventDefault();
                  setDigits(
                    Array.from({ length: 6 }, (_, i) => pasted[i] || "")
                  );
                  refs.current[Math.min(pasted.length, 5)]?.focus();
                }
              }}
              className="h-12 w-full rounded-lg border border-slate-300 text-center text-lg font-semibold outline-none focus:border-orange-500"
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 py-2.5 text-white disabled:opacity-60"
        >
          {loading ? "Verifying OTP…" : "Verify OTP"}
        </button>
      </form>

      <button
        type="button"
        disabled={loading || seconds > 0}
        onClick={resend}
        className="mt-4 w-full text-sm font-medium text-orange-600 disabled:text-slate-400"
      >
        {seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
      </button>
    </AuthShell>
  );
}

export default function VerifyOtpPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center text-sm text-slate-500">
          Loading…
        </main>
      }
    >
      <VerifyOtpPage />
    </Suspense>
  );
}
